import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';
import type { IUploadService } from '../../domain/repositories/interfaces';

export class FirebaseUploadService implements IUploadService {
  async uploadFile(file: File, path?: string): Promise<string> {
    const storagePath = path || `uploads/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}
