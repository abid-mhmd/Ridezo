export interface RemoveProfilePhotoResult {
  message: string;
}

export interface IRemoveProfilePhotoUseCase {
  execute(userId: string): Promise<RemoveProfilePhotoResult>;
}

export const REMOVE_PROFILE_PHOTO_USE_CASE = Symbol(
  'REMOVE_PROFILE_PHOTO_USE_CASE',
);
