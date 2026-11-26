import type { IdentityDocumentType } from '../types/identity-verification.types';

export interface IdentityDocumentOption {
  type: IdentityDocumentType;
  title: string;
  subtitle: string;
  enabled: boolean;
  badge: string;
}

export const IDENTITY_DOCUMENT_OPTIONS: readonly IdentityDocumentOption[] = [
  {
    type: 'driving_license',
    title: 'Driving License',
    subtitle: 'Instant OCR check · Required for offering rides',
    enabled: true,
    badge: 'Available Now',
  },
  {
    type: 'aadhaar',
    title: 'Aadhaar Offline eKYC',
    subtitle: 'UIDAI paperless ZIP / Secure QR verification',
    enabled: false,
    badge: 'Coming Soon',
  },
  {
    type: 'pan',
    title: 'PAN Card',
    subtitle: 'Government-issued Permanent Account Number',
    enabled: false,
    badge: 'Coming Soon',
  },
  {
    type: 'passport',
    title: 'Passport',
    subtitle: 'Indian passport identity verification',
    enabled: false,
    badge: 'Coming Soon',
  },
] as const;

export const ALLOWED_IDENTITY_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_IDENTITY_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
