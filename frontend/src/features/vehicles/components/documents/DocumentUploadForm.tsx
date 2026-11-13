import { useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

import type { VehicleDocumentType } from '../../types/vehicle-document.types';

interface DocumentUploadFormProps {
  documentType: VehicleDocumentType;
  onUpload: (documentType: VehicleDocumentType, file: File) => Promise<void>;
  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function DocumentUploadForm({
  documentType,
  onUpload,
  onClose,
}: DocumentUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(selectedFile?: File) {
    setError(null);

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Only PDF, JPEG and PNG files are allowed.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 5 MB.');
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit() {
    if (!file) {
      setError('Please select a document.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      await onUpload(documentType, file);

      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Unable to upload document.',
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#30394b] bg-[#111722] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Upload Vehicle Document
        </h3>

        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="text-[#929bad] hover:text-white"
          aria-label="Close upload form"
        >
          <X size={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="mt-4 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#46516a] bg-[#171f2d] px-4 py-8 text-center transition hover:border-[#8b78ff]"
      >
        {file ? (
          <>
            <FileText size={25} className="text-[#a99aff]" />
            <p className="mt-2 text-xs font-medium text-white">{file.name}</p>
            <p className="mt-1 text-[10px] text-[#929bad]">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <Upload size={25} className="text-[#a99aff]" />
            <p className="mt-2 text-xs font-medium text-white">
              Click to select a document
            </p>
            <p className="mt-1 text-[10px] text-[#929bad]">
              PDF, JPEG or PNG · Maximum 5 MB
            </p>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      {error && (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="rounded-lg border border-[#30394b] px-4 py-2 text-xs text-[#c7cddd] hover:bg-[#1b2230] disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!file || isUploading}
          className="rounded-lg bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </div>
  );
}
