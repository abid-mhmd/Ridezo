export const IDENTITY_DOCUMENT_STORAGE = Symbol('IDENTITY_DOCUMENT_STORAGE');

export interface IIdentityDocumentStorage {
  upload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ objectKey: string }>;
  getUrl(objectKey: string): Promise<string>;
  delete(objectKey: string): Promise<void>;
}
