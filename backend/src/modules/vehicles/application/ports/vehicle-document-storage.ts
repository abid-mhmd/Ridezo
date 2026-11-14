export const VEHICLE_DOCUMENT_STORAGE = Symbol('VEHICLE_DOCUMENT_STORAGE');

export interface IVehicleDocumentStorage {
  upload(
    file: Buffer,
    contentType: string,
  ): Promise<{
    objectKey: string;
  }>;

  getUrl(objectKey: string): Promise<string>;
  download(objectKey: string): Promise<{
    buffer: Buffer;
    contentType: string;
  }>;
  delete(objectKey: string): Promise<void>;
}
