export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  jgId: string;
  createdAt: number;
  handle?: string;
  statusMessage?: string;
  banned?: boolean;
  violationPoints?: number;
  reportCount?: number;
  correctReports?: number;
  reportAccuracy?: number;
  lastSeen?: number;
  status?: 'online' | 'offline' | 'away' | 'dnd' | 'invisible';
  publicKey?: string;
  encryptedPrivateKey?: string;
  contacts?: Record<string, Contact>;
  blocked?: Record<string, boolean>;
  closeFriends?: Record<string, boolean>;
  ban?: BanDetails;
  deletionScheduled?: boolean;
  deletionTimestamp?: number;
}

export interface Contact {
  uid: string;
  name: string;
  jgId: string;
  addedAt: number;
  photoUrl?: string;
}

export interface BanDetails {
  isBanned: boolean;
  banType?: 'chat_ban' | 'full_ban' | 'permanent_ban';
  banReason?: string;
  banExpiresAt?: number;
  isPermanent?: boolean;
  isAutoBan?: boolean;
  canUsePrivate?: boolean;
  canUseGroup?: boolean;
  canUseBroadcast?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  receiver?: string;
  timestamp: number | any; // serverTimestamp
  read?: boolean;
  readAt?: number;
  reactions?: Record<string, string>;
  replyTo?: string | null;
  edited?: boolean;
  forwarded?: boolean;
  deletedFor?: Record<string, boolean>;
  image?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  voice?: string | null;
  pinned?: boolean;
  isStoryReply?: boolean;
  storyId?: string;
  storyAuthor?: string;
  storyMedia?: string;
  storyType?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: string;
  createdAt: number | any;
  members: Record<string, boolean>;
  admins: Record<string, boolean>;
  keyRing?: Record<string, GroupKey>;
}

export interface GroupKey {
  encryptedKey: string;
  encryptedAt: number;
}

export interface Broadcast {
  id: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: string;
  createdAt: number | any;
  isOfficial: boolean;
  inviteCode?: string;
  members: Record<string, BroadcastMember>;
  messages?: Record<string, BroadcastMessage>;
  invites?: Record<string, BroadcastInvite>;
  pinnedMessages?: Record<string, PinnedMessage>;
}

export interface BroadcastMember {
  role: 'admin' | 'member';
  joinedAt: number | any;
}

export interface BroadcastMessage extends Message {
  isSystem?: boolean;
}

export interface BroadcastInvite {
  channelId: string;
  createdBy: string;
  expiresAt: number | null;
  isOfficial: boolean;
  createdAt: number | any;
}

export interface PinnedMessage {
  pinnedBy: string;
  pinnedAt: number | any;
  text: string;
  senderName: string;
}

export interface Story {
  storyId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  timestamp: number;
  isCloseFriendsOnly: boolean;
  authorUid: string;
  viewers?: Record<string, StoryViewer>;
  comments?: Record<string, StoryComment>;
}

export interface StoryViewer {
  name: string;
  photoUrl: string | null;
  timestamp: number;
}

export interface StoryComment {
  username: string;
  text: string;
  timestamp: number;
}
