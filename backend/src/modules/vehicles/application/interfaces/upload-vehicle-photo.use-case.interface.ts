export interface UploadVehiclePhotoInput {
  buffer: Buffer;
  mimetype: string;
}

export interface UploadVehiclePhotoResult {
  vehiclePhoto: string;
  vehiclePhotoKey: string;
}

export interface IUploadVehiclePhotoUseCase {
  execute(file: UploadVehiclePhotoInput): Promise<UploadVehiclePhotoResult>;
}

export const UPLOAD_VEHICLE_PHOTO_USE_CASE = Symbol(
  'UPLOAD_VEHICLE_PHOTO_USE_CASE',
);
