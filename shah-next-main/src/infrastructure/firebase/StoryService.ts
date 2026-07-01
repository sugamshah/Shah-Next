import { 
  ref, 
  push, 
  set, 
  get, 
  onValue 
} from 'firebase/database';
import { db } from './config';
import type { IStoryService } from '../../domain/repositories/interfaces';
import type { Story } from '../../domain/entities';

export class FirebaseStoryService implements IStoryService {
  async uploadStory(story: Partial<Story>): Promise<void> {
    const storiesRef = ref(db, `users/${story.authorUid}/stories`);
    const newStoryRef = push(storiesRef);
    const storyId = newStoryRef.key!;
    
    await set(newStoryRef, {
      ...story,
      storyId,
      timestamp: Date.now(),
      viewers: {},
      comments: {}
    });
  }

  listenStories(uid: string, contactUids: string[], callback: (stories: any[]) => void): () => void {
    // This is complex in RTDB because we need to listen to multiple users' stories.
    // For simplicity, we'll listen to the user's contacts and then fetch their stories.
    const allUids = Array.from(new Set([uid, ...contactUids]));
    const listeners: (() => void)[] = [];

    const handleStoriesUpdate = async () => {
      const allStories: any[] = [];
      for (const authorUid of allUids) {
        if (!authorUid) continue;
        try {
          const storiesSnap = await get(ref(db, `users/${authorUid}/stories`));
          if (storiesSnap.exists()) {
            const userStories = storiesSnap.val();
            const storiesList: Story[] = Object.values(userStories);
            // Filter expired (24h)
            const validStories = storiesList.filter(s => s && s.timestamp && Date.now() - s.timestamp < 24 * 60 * 60 * 1000);
            
            if (validStories.length > 0) {
              const userSnap = await get(ref(db, `users/${authorUid}`));
              const userData = userSnap.val();
              allStories.push({
                uid: authorUid,
                name: userData?.name || 'User',
                photoUrl: userData?.photoURL || null,
                storiesList: validStories.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              });
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (!/permission|denied/i.test(message)) {
            console.error(`Error fetching stories for ${authorUid}`, err);
          }
        }
      }
      callback(allStories);
    };

    allUids.forEach(authorUid => {
      const l = onValue(ref(db, `users/${authorUid}/stories`), () => {
        handleStoriesUpdate();
      });
      listeners.push(() => l());
    });

    handleStoriesUpdate();

    return () => {
      listeners.forEach(unsub => unsub());
    };
  }

  async viewStory(authorUid: string, storyId: string, viewerUid: string, viewerName: string, viewerPhoto: string | null): Promise<void> {
    await set(ref(db, `users/${authorUid}/stories/${storyId}/viewers/${viewerUid}`), {
      name: viewerName,
      photoUrl: viewerPhoto,
      timestamp: Date.now()
    });
  }
}
