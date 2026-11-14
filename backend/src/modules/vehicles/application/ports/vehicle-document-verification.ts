export const VEHICLE_DOCUMENT_VERIFICATION = Symbol(
  'VEHICLE_DOCUMENT_VERIFICATION',
);

export interface ExtractedVehicleDocumentData {
  registrationNumber: string | null;
  expiryDate: Date | null;
  isReadable: boolean;
}

export interface IVehicleDocumentVerification {
  extractData(
    documentKey: string,
    mimeType: string,
  ): Promise<ExtractedVehicleDocumentData>;
}
