import { IUploadService } from '../../domain/repositories/interfaces';

export class CloudinaryUploadService implements IUploadService {
  private cloudName = "dz0uzidoi";
  private uploadPreset = "shah_upload";

  async uploadFile(file: File, path?: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.uploadPreset);
    formData.append("cloud_name", this.cloudName);
    
    if (path) {
      formData.append("folder", path);
    }

    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  }
}
