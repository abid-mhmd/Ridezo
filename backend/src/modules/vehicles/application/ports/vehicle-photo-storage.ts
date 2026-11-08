export const VEHICLE_PHOTO_STORAGE = Symbol('VEHICLE_PHOTO_STORAGE');

export interface IVehiclePhotoStorage {
  upload(file: Buffer): Promise<{
    secureUrl: string;
    publicId: string;
  }>;

  delete(publicId: string): Promise<void>;
}
