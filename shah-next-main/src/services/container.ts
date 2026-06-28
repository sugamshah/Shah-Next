import { FirebaseAuthService } from '../infrastructure/firebase/AuthService';
import { FirebaseUserService } from '../infrastructure/firebase/UserService';
import { FirebaseChatService } from '../infrastructure/firebase/ChatService';
import { FirebaseGroupService } from '../infrastructure/firebase/GroupService';
import { FirebaseBroadcastService } from '../infrastructure/firebase/BroadcastService';
import { FirebaseStoryService } from '../infrastructure/firebase/StoryService';
import { FirebaseUploadService } from '../infrastructure/firebase/UploadService';
import { FirebaseNotificationService } from '../infrastructure/firebase/NotificationService';
import { FirebaseAdminService } from '../infrastructure/firebase/AdminService';
import { 
  IAuthService, 
  IUserService, 
  IChatService, 
  IGroupService, 
  IBroadcastService, 
  IStoryService, 
  IUploadService 
} from '../domain/repositories/interfaces';

class ServiceContainer {
  public auth: IAuthService;
  public user: IUserService;
  public chat: IChatService;
  public group: IGroupService;
  public broadcast: IBroadcastService;
  public story: IStoryService;
  public upload: IUploadService;
  public notification: FirebaseNotificationService;
  public admin: FirebaseAdminService;

  constructor() {
    this.auth = new FirebaseAuthService();
    this.user = new FirebaseUserService();
    this.chat = new FirebaseChatService();
    this.group = new FirebaseGroupService();
    this.broadcast = new FirebaseBroadcastService();
    this.story = new FirebaseStoryService();
    this.upload = new FirebaseUploadService();
    this.notification = new FirebaseNotificationService();
    this.admin = new FirebaseAdminService();
  }
}

export const services = new ServiceContainer();
