import { FileText, Eye, RefreshCw, Upload } from 'lucide-react';

import type {
  VehicleDocument,
  VehicleDocumentType,
} from '../../types/vehicle-document.types';

import DocumentStatusBadge from './DocumentStatusBadge';

interface VehicleDocumentCardProps {
  documentType: VehicleDocumentType;
  document: VehicleDocument | null;
  onUpload: (documentType: VehicleDocumentType) => void;
  onVerify: (documentId: string) => void;
  isUploading: boolean;
  isVerifying: boolean;
}

const DOCUMENT_LABELS: Record<VehicleDocumentType, string> = {
  registration_certificate: 'Registration Certificate (RC)',
  insurance: 'Insurance',
  pollution_certificate: 'Pollution Certificate (PUC)',
};

export default function VehicleDocumentCard({
  documentType,
  document,
  onUpload,
  onVerify,
  isUploading,
  isVerifying,
}: VehicleDocumentCardProps) {
  const isUploaded = Boolean(document);

  return (
    <div className="rounded-xl border border-[#252e3e] bg-[#111722] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b78ff]/10 text-[#a99aff]">
            <FileText size={19} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              {DOCUMENT_LABELS[documentType]}
            </h3>
            <p className="mt-1 text-[11px] text-[#929bad]">
              {isUploaded ? 'Document uploaded' : 'Not uploaded yet'}
            </p>
          </div>
        </div>

        {document && (
          <DocumentStatusBadge status={document.verificationStatus} />
        )}
      </div>

      {document && (
        <div className="mt-4 space-y-2 border-t border-[#252e3e] pt-3">
          <p className="text-xs text-[#929bad]">
            Uploaded:{' '}
            <span className="text-[#c7cddd]">
              {new Date(document.createdAt).toLocaleDateString()}
            </span>
          </p>

          {document.expiryDate && (
            <p className="text-xs text-[#929bad]">
              Expires:{' '}
              <span className="text-[#c7cddd]">
                {new Date(document.expiryDate).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {document?.documentUrl && (
          <a
            href={document.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#30394b] px-3 py-2 text-xs text-[#c7cddd] transition hover:bg-[#1b2230]"
          >
            <Eye size={13} />
            View
          </a>
        )}

        <button
          type="button"
          onClick={() => onUpload(documentType)}
          disabled={isUploading || isVerifying}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#8b78ff] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#7965ee] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={13} />
          {isUploaded ? 'Replace' : 'Upload'}
        </button>

        {document && document.verificationStatus === 'pending' && (
          <button
            type="button"
            onClick={() => onVerify(document.id)}
            disabled={isVerifying || isUploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#30394b] px-3 py-2 text-xs text-[#c7cddd] transition hover:bg-[#1b2230] disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={isVerifying ? 'animate-spin' : ''}
            />
            {isVerifying ? 'Checking...' : 'Verify'}
          </button>
        )}
      </div>
    </div>
  );
}
