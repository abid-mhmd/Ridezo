export const PROFILE_PHOTO_STORAGE = Symbol('PROFILE_PHOTO_STORAGE');

export interface IProfilePhotoStorage {
  upload(
    file: Buffer,
    contentType: string,
  ): Promise<{
    objectKey: string;
  }>;

  getUrl(objectKey: string): Promise<string>;

  delete(objectKey: string): Promise<void>;
}
