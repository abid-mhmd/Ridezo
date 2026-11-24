export type AdminVehicleType = 'hatchback' | 'sedan' | 'suv' | 'muv' | 'van';

export type AdminFuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';

export type AdminVehicleVerificationStatus =
  'pending' | 'approved' | 'rejected';

export type AdminDocumentVerificationStatus =
  'pending' | 'approved' | 'verified' | 'rejected';

export interface AdminVehicleOwner {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profilePhoto: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface AdminVehicleDocumentSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface AdminVehicleListItem {
  id: string;
  owner: AdminVehicleOwner | null;
  vehicleType: AdminVehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  seatCapacity: number;
  fuelType: AdminFuelType;
  vehiclePhoto: string;
  verificationStatus: AdminVehicleVerificationStatus;
  isActive: boolean;
  documentsSummary: AdminVehicleDocumentSummary;
  createdAt: string;
}

export interface AdminVehicleDocument {
  id: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  documentUrl: string;
  verificationStatus: AdminDocumentVerificationStatus;
  expiryDate: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AdminVehicleDetails {
  id: string;
  owner: AdminVehicleOwner | null;
  vehicleType: AdminVehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  seatCapacity: number;
  fuelType: AdminFuelType;
  vehiclePhoto: string;
  verificationStatus: AdminVehicleVerificationStatus;
  isActive: boolean;
  documents: AdminVehicleDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminVehicleListParams {
  page: number;
  limit: number;
  search?: string;
  status?: AdminVehicleVerificationStatus | '';
}

export interface AdminVehiclePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminVehicleListResponse {
  vehicles: AdminVehicleListItem[];
  pagination: AdminVehiclePagination;
}

export interface ReviewVehicleDocumentPayload {
  status: 'approved' | 'verified' | 'rejected' | 'pending';
  rejectionReason?: string;
}

export interface UpdateVehicleStatusPayload {
  status: AdminVehicleVerificationStatus;
}
