export const PROFILE_PHOTO_STORAGE = Symbol('PROFILE_PHOTO_STORAGE');

export interface IProfilePhotoStorage {
  upload(file: Buffer): Promise<{
    secureUrl: string;
    publicId: string;
  }>;

  delete(publicId: string): Promise<void>;
}
