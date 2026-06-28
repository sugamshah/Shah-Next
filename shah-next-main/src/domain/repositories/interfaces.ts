import { User, Message, Group, Broadcast, Story } from '../entities';

export interface IAuthService {
  onAuthStateChanged(callback: (user: any | null) => void): () => void;
  signIn(email: string, password: string): Promise<any>;
  signUp(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  updateProfile(name: string, photoURL: string): Promise<void>;
}

export interface IUserService {
  getUserProfile(uid: string): Promise<User | null>;
  saveUserProfile(user: User): Promise<void>;
  updateUserProfile(uid: string, updates: Partial<User>): Promise<void>;
  findUserByJgId(jgId: string): Promise<User | null>;
  listenToUserProfile(uid: string, callback: (user: User | null) => void): () => void;
  getBlockedUsers(uid: string): Promise<string[]>;
  toggleBlockUser(uid: string, targetUid: string): Promise<void>;
  updateUserStatus(uid: string, status: User['status']): Promise<void>;
  sendRequest(uid: string, targetUser: User): Promise<void>;
  reportUser(reportedUid: string, reporterUid: string, reason: string, reportType: string): Promise<void>;
}

export interface IChatService {
  sendMessage(roomId: string, message: Partial<Message>): Promise<void>;
  listenMessages(roomId: string, callback: (messages: Message[]) => void): () => void;
  listenChatList(uid: string, callback: (chats: any[]) => void): () => void;
  markAsRead(roomId: string, uid: string, friendUid: string): Promise<void>;
  deleteMessage(roomId: string, messageId: string, forEveryone: boolean, uid: string): Promise<void>;
  editMessage(roomId: string, messageId: string, text: string): Promise<void>;
  togglePinMessage(roomId: string, messageId: string): Promise<void>;
  addReaction(roomId: string, messageId: string, emoji: string, uid: string): Promise<void>;
  reportMessage(messageId: string, reporterUid: string, reason: string): Promise<void>;
  clearChat(roomId: string, uid: string): Promise<void>;
}

export interface IGroupService {
  createGroup(group: Partial<Group>, creatorUid: string): Promise<string>;
  getGroup(groupId: string): Promise<Group | null>;
  updateGroup(groupId: string, updates: Partial<Group>): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
  joinGroup(groupId: string, uid: string): Promise<void>;
  leaveGroup(groupId: string, uid: string): Promise<void>;
  listenUserGroups(uid: string, callback: (groups: Group[]) => void): () => void;
}

export interface IBroadcastService {
  createChannel(channel: Partial<Broadcast>, creatorUid: string): Promise<string>;
  getChannel(channelId: string): Promise<Broadcast | null>;
  getChannelByInviteCode(inviteCode: string): Promise<Broadcast | null>;
  joinChannel(channelId: string, uid: string): Promise<void>;
  joinChannelByInviteCode(inviteCode: string, uid: string): Promise<string>;
  leaveChannel(channelId: string, uid: string): Promise<void>;
  updateChannel(channelId: string, updates: Partial<Broadcast>): Promise<void>;
  deleteChannel(channelId: string): Promise<void>;
  sendMessage(channelId: string, message: Partial<Message>): Promise<void>;
  listenChannels(uid: string, callback: (channels: Broadcast[]) => void): () => void;
}

export interface IStoryService {
  uploadStory(story: Partial<Story>): Promise<void>;
  listenStories(uid: string, contactUids: string[], callback: (stories: any[]) => void): () => void;
  viewStory(authorUid: string, storyId: string, viewerUid: string, viewerName: string, viewerPhoto: string | null): Promise<void>;
}

export interface IUploadService {
  uploadFile(file: File, path: string): Promise<string>;
}
