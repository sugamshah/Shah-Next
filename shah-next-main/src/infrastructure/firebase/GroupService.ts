import { 
  ref, 
  push, 
  set, 
  onValue, 
  update, 
  serverTimestamp, 
  get 
} from 'firebase/database';
import { db } from './config';
import type { IGroupService } from '../../domain/repositories/interfaces';
import type { Group } from '../../domain/entities';

export class FirebaseGroupService implements IGroupService {
  async createGroup(group: Partial<Group>, creatorUid: string): Promise<string> {
    const groupRef = push(ref(db, 'groups'));
    const groupId = groupRef.key!;
    
    const groupData: Group = {
      ...group as Group,
      id: groupId,
      createdBy: creatorUid,
      createdAt: serverTimestamp(),
      members: { [creatorUid]: true },
      admins: { [creatorUid]: true }
    };

    await set(groupRef, groupData);
    await set(ref(db, `userGroups/${creatorUid}/${groupId}`), true);
    
    return groupId;
  }

  async getGroup(groupId: string): Promise<Group | null> {
    const snap = await get(ref(db, `groups/${groupId}`));
    return snap.exists() ? (snap.val() as Group) : null;
  }

  async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    await update(ref(db, `groups/${groupId}`), updates);
  }

  async deleteGroup(groupId: string): Promise<void> {
    const group = await this.getGroup(groupId);
    if (!group) return;

    const members = Object.keys(group.members || {});
    for (const uid of members) {
      await set(ref(db, `userGroups/${uid}/${groupId}`), null);
    }
    
    await set(ref(db, `groups/${groupId}`), null);
    await set(ref(db, `groupMessages/${groupId}`), null);
  }

  async joinGroup(groupId: string, uid: string): Promise<void> {
    const memberRef = ref(db, `groups/${groupId}/members/${uid}`);
    const memberSnap = await get(memberRef);
    if (memberSnap.exists()) {
      await set(ref(db, `userGroups/${uid}/${groupId}`), true);
      return;
    }

    await set(memberRef, true);
    await set(ref(db, `userGroups/${uid}/${groupId}`), true);
  }

  async leaveGroup(groupId: string, uid: string): Promise<void> {
    await set(ref(db, `groups/${groupId}/members/${uid}`), null);
    await set(ref(db, `userGroups/${uid}/${groupId}`), null);
  }

  listenUserGroups(uid: string, callback: (groups: Group[]) => void): () => void {
    const userGroupsRef = ref(db, `userGroups/${uid}`);
    let groupListeners: Record<string, () => void> = {};
    let groupsMap: Record<string, Group> = {};

    const unsubUserGroups = onValue(userGroupsRef, (snap) => {
      const currentGroupIds = snap.exists() ? Object.keys(snap.val()) : [];
      
      // Remove listeners for groups we are no longer part of
      Object.keys(groupListeners).forEach(id => {
        if (!currentGroupIds.includes(id)) {
          groupListeners[id]();
          delete groupListeners[id];
          delete groupsMap[id];
        }
      });

      // Add listeners for new groups
      currentGroupIds.forEach(id => {
        if (!groupListeners[id]) {
          const groupRef = ref(db, `groups/${id}`);
          groupListeners[id] = onValue(groupRef, (groupSnap) => {
            if (groupSnap.exists()) {
              groupsMap[id] = { ...groupSnap.val(), id } as Group;
            } else {
              delete groupsMap[id];
            }
            callback(Object.values(groupsMap));
          }, (err) => {
            console.error(`Error listening to group ${id}:`, err);
          });
        }
      });

      if (currentGroupIds.length === 0) {
        callback([]);
      }
    }, (err) => {
      console.error('listenUserGroups error:', err);
      callback([]);
    });

    return () => {
      unsubUserGroups();
      Object.values(groupListeners).forEach(unsub => unsub());
    };
  }
}
