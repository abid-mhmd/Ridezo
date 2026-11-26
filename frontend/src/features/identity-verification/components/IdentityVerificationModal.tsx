import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck2,
  LoaderCircle,
  Lock,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';

import {
  ALLOWED_IDENTITY_MIME_TYPES,
  IDENTITY_DOCUMENT_OPTIONS,
  MAX_IDENTITY_FILE_SIZE_BYTES,
} from '../constants/identity-documents.constants';
import { submitIdentityVerification } from '../api/identity-verification.api';
import type {
  IdentityDocumentType,
  IdentityVerificationInfo,
} from '../types/identity-verification.types';

interface IdentityVerificationModalProps {
  isOpen: boolean;
  currentVerification?: IdentityVerificationInfo | null;
  onClose: () => void;
  onVerified: (info: IdentityVerificationInfo) => void;
  onStatusUpdated?: (info: IdentityVerificationInfo) => void;
}

export default function IdentityVerificationModal({
  isOpen,
  currentVerification,
  onClose,
  onVerified,
  onStatusUpdated,
}: IdentityVerificationModalProps) {
  const [selectedType, setSelectedType] =
    useState<IdentityDocumentType>('driving_license');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IdentityVerificationInfo | null>(null);

  if (!isOpen) return null;

  const activeInfo = result ?? currentVerification;
  const status = activeInfo?.status ?? 'not_started';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;

    if (
      !(ALLOWED_IDENTITY_MIME_TYPES as readonly string[]).includes(picked.type)
    ) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (picked.size > MAX_IDENTITY_FILE_SIZE_BYTES) {
      setError('File size must be 5 MB or less.');
      return;
    }

    setError('');
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a clear photo of your document.');
      return;
    }
    if (!consentGiven) {
      setError('Please confirm your consent to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const updated = await submitIdentityVerification({
        documentType: selectedType,
        consentGiven,
        file,
      });

      setResult(updated);
      onStatusUpdated?.(updated);

      if (updated.status === 'verified') {
        onVerified(updated);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to verify document. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={isSubmitting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#252e3e] bg-[#111722] p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#252e3e] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b78ff]/15 text-[#8b78ff]">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">
                Identity Verification Required
              </h2>
              <p className="text-[11px] text-[#929bad]">
                Verify your identity to offer rides safely on Ridezo.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-[#929bad] hover:text-white disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Pending Review State */}
        {status === 'pending' && (
          <div className="mt-5 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Verification Under Admin Review
              </h3>
              <p className="mt-1 text-xs text-[#929bad]">
                We couldn&apos;t auto-verify your document clearly, so it has
                been sent to our team for quick manual review. You&apos;ll be
                able to offer rides as soon as it&apos;s approved.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full cursor-pointer rounded-xl bg-[#252e3e] py-2.5 text-xs font-semibold text-white hover:bg-[#30394b]"
            >
              Got It
            </button>
          </div>
        )}

        {/* Auto-Verified State */}
        {status === 'verified' && (
          <div className="mt-5 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#36e0c0]/15 text-[#36e0c0]">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Identity Verified!
              </h3>
              <p className="mt-1 text-xs text-[#929bad]">
                Your Driving License ({activeInfo?.maskedDocumentNumber}) has
                been verified automatically.
              </p>
            </div>
          </div>
        )}

        {/* Upload Form (not_started or rejected) */}
        {(status === 'not_started' || status === 'rejected') && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {status === 'rejected' && activeInfo?.rejectionReason && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Previous attempt rejected</p>
                  <p className="mt-0.5 text-[11px]">
                    {activeInfo.rejectionReason}
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Document Type Selector */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                1. Choose Document Type
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {IDENTITY_DOCUMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      disabled={!opt.enabled}
                      onClick={() => opt.enabled && setSelectedType(opt.type)}
                      className={`rounded-xl border p-3 text-left transition ${
                        !opt.enabled
                          ? 'cursor-not-allowed border-[#252e3e] bg-[#080b12]/50 opacity-55'
                          : isSelected
                            ? 'cursor-pointer border-[#8b78ff] bg-[#8b78ff]/15'
                            : 'cursor-pointer border-[#252e3e] bg-[#080b12] hover:border-[#3b4a68]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {opt.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                            opt.enabled
                              ? 'bg-[#36e0c0]/15 text-[#36e0c0]'
                              : 'bg-white/5 text-[#929bad]'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-[#929bad]">
                        {opt.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Upload Photo */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#929bad]">
                2. Upload Front Photo (Clear &amp; Uncropped)
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#30394b] bg-[#080b12] p-4 text-center transition hover:border-[#8b78ff]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="max-h-40 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <Upload size={20} className="text-[#8b78ff]" />
                    <p className="mt-2 text-xs font-medium text-white">
                      Click to upload Driving License image
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#929bad]">
                      JPG, PNG, or WEBP · Max 5 MB
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Privacy & Consent */}
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#252e3e] bg-[#080b12] p-3 text-[11px] text-[#c7cddd]">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 accent-[#8b78ff]"
              />
              <span>
                I consent to Ridezo verifying my name and license validity.{' '}
                <span className="inline-flex items-center gap-1 text-[#36e0c0]">
                  <Lock size={10} /> Auto-verified photos are never stored; IDs
                  are masked.
                </span>
              </span>
            </label>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-300">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="cursor-pointer rounded-xl border border-[#252e3e] bg-[#080b12] px-4 py-2.5 text-xs font-medium text-[#c7cddd] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !file || !consentGiven}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={14} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FileCheck2 size={14} />
                    Verify &amp; Continue
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
