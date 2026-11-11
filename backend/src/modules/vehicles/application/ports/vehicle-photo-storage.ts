export const VEHICLE_PHOTO_STORAGE = Symbol('VEHICLE_PHOTO_STORAGE');

export interface IVehiclePhotoStorage {
  upload(
    file: Buffer,
    contentType: string,
  ): Promise<{
    objectKey: string;
  }>;

  getUrl(objectKey: string): Promise<string>;

  delete(objectKey: string): Promise<void>;
}
