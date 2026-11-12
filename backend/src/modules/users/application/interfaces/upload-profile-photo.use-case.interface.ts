export interface UploadProfilePhotoInput {
  buffer: Buffer;
  mimetype: string;
}

export interface UploadProfilePhotoResult {
  message: string;
  profilePhoto: string;
}

export interface IUploadProfilePhotoUseCase {
  execute(
    userId: string,
    file: UploadProfilePhotoInput,
  ): Promise<UploadProfilePhotoResult>;
}

export const UPLOAD_PROFILE_PHOTO_USE_CASE = Symbol(
  'UPLOAD_PROFILE_PHOTO_USE_CASE',
);
