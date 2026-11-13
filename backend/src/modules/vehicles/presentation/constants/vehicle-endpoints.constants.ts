export const VEHICLE_ENDPOINTS = {
  ROOT: '/vehicles',
  BY_ID: '/vehicles/:vehicleId',
  PHOTO: '/vehicles/photo',
  DOCUMENTS: '/vehicles/:vehicleId/documents',
  VERIFY_DOCUMENT: '/vehicles/:vehicleId/documents/:documentId/verify',
} as const;
