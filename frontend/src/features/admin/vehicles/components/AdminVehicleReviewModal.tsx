import { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiExternalLink,
  FiFileText,
  FiMail,
  FiPhone,
  FiShield,
  FiTruck,
  FiUser,
  FiX,
  FiXCircle,
} from 'react-icons/fi';

import StatusBadge from '../../components/StatusBadge';
import UserAvatar from '../../../../components/UserAvatar';
import LoadingState from '../../../../components/LoadingState';
import {
  getAdminVehicleDetails,
  reviewAdminVehicleDocument,
  updateAdminVehicleStatus,
} from '../api/admin-vehicle.api';
import type {
  AdminVehicleDetails,
  AdminVehicleDocument,
  AdminVehicleVerificationStatus,
} from '../types/admin-vehicle.types';

interface AdminVehicleReviewModalProps {
  accessToken: string;
  vehicleId: string | null;
  onClose: () => void;
  onViewOwner: (ownerId: string) => void;
  onUpdated: () => void;
}

// Match your backend DocumentVerificationStatus enum value ('verified' or 'approved')
const APPROVED_DOCUMENT_STATUS = 'approved' as const;

function formatDate(value: string | null): string {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDocumentType(type: string): string {
  return type
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isDocumentApproved(status: string): boolean {
  return ['approved', 'verified'].includes(status.toLowerCase());
}

export default function AdminVehicleReviewModal({
  accessToken,
  vehicleId,
  onClose,
  onViewOwner,
  onUpdated,
}: AdminVehicleReviewModalProps) {
  const [details, setDetails] = useState<AdminVehicleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyDocumentId, setBusyDocumentId] = useState<string | null>(null);
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);

  // Inline rejection form state per document
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadVehicleDetails = async (targetVehicleId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getAdminVehicleDetails(accessToken, targetVehicleId);
      setDetails(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to load vehicle details.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!vehicleId) {
      setDetails(null);
      setError('');
      setActionError('');
      setRejectingDocId(null);
      setRejectionReason('');
      return;
    }

    void loadVehicleDetails(vehicleId);
  }, [accessToken, vehicleId]);

  useEffect(() => {
    if (!vehicleId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [vehicleId, onClose]);

  if (!vehicleId) return null;

  const handleApproveDocument = async (doc: AdminVehicleDocument) => {
    if (!details) return;

    setBusyDocumentId(doc.id);
    setActionError('');

    try {
      await reviewAdminVehicleDocument(accessToken, details.id, doc.id, {
        status: APPROVED_DOCUMENT_STATUS,
      });

      setRejectingDocId(null);
      setRejectionReason('');
      await loadVehicleDetails(details.id);
      onUpdated();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to approve document.',
      );
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleConfirmRejectDocument = async (docId: string) => {
    if (!details) return;

    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setActionError('Please enter a rejection reason before rejecting.');
      return;
    }

    setBusyDocumentId(docId);
    setActionError('');

    try {
      await reviewAdminVehicleDocument(accessToken, details.id, docId, {
        status: 'rejected',
        rejectionReason: trimmed,
      });

      setRejectingDocId(null);
      setRejectionReason('');
      await loadVehicleDetails(details.id);
      onUpdated();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to reject document.',
      );
    } finally {
      setBusyDocumentId(null);
    }
  };

  const handleUpdateVehicleStatus = async (
    status: AdminVehicleVerificationStatus,
  ) => {
    if (!details) return;

    setIsUpdatingVehicle(true);
    setActionError('');

    try {
      await updateAdminVehicleStatus(accessToken, details.id, { status });
      await loadVehicleDetails(details.id);
      onUpdated();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Failed to update vehicle verification status.',
      );
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  const approvedDocsCount =
    details?.documents.filter((doc) =>
      isDocumentApproved(doc.verificationStatus),
    ).length ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vehicle verification details"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#263044] bg-[#0B101B] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#263044] bg-[#080B12] px-6 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {details && (
              <span className="rounded-md border border-[#263044] bg-[#F8FAFC] px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-[#080B12]">
                {details.registrationNumber}
              </span>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="truncate text-base font-bold text-[#F8FAFC]">
                  {details
                    ? `${details.brand} ${details.model} (${details.year})`
                    : 'Vehicle Details'}
                </h2>
                {details && <StatusBadge status={details.verificationStatus} />}
              </div>
              {details && (
                <p className="mt-0.5 text-[11px] text-[#707B8F]">
                  Vehicle ID: #{details.id.slice(-6).toUpperCase()} · Added{' '}
                  {formatDate(details.createdAt)}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-[#A7B0C0] transition hover:bg-[#111722] hover:text-[#F8FAFC]"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {isLoading && !details ? (
            <div className="py-16 text-center">
              <LoadingState />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
              {error}
            </div>
          ) : details ? (
            <>
              {actionError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  <FiAlertCircle size={15} className="shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Vehicle Specs & Registered Owner */}
              <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                  Vehicle Specifications &amp; Registered Owner
                </p>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                  {/* Vehicle Photo */}
                  <div className="md:col-span-5">
                    {details.vehiclePhoto ? (
                      <img
                        src={details.vehiclePhoto}
                        alt={`${details.brand} ${details.model}`}
                        className="h-44 w-full rounded-xl border border-[#263044] object-cover"
                      />
                    ) : (
                      <div className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border border-[#263044] bg-[#080B12] text-[#707B8F]">
                        <FiTruck size={28} />
                        <span className="text-xs">No vehicle photo</span>
                      </div>
                    )}
                  </div>

                  {/* Specs + Owner */}
                  <div className="flex flex-col justify-between gap-4 md:col-span-7">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#707B8F]">
                          Body Type
                        </p>
                        <p className="mt-1 text-xs font-semibold capitalize text-[#F8FAFC]">
                          {details.vehicleType}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#707B8F]">
                          Fuel Type
                        </p>
                        <p className="mt-1 text-xs font-semibold capitalize text-[#F8FAFC]">
                          {details.fuelType}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#707B8F]">
                          Seat Capacity
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#F8FAFC]">
                          {details.seatCapacity} Seats
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#263044] bg-[#080B12] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#707B8F]">
                          Color
                        </p>
                        <p className="mt-1 text-xs font-semibold capitalize text-[#F8FAFC]">
                          {details.color}
                        </p>
                      </div>
                    </div>

                    {/* Owner Basic Info + View Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263044] bg-[#080B12] p-3.5">
                      {details.owner ? (
                        <>
                          <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar
                              firstName={details.owner.firstName}
                              lastName={details.owner.lastName ?? ''}
                              profilePhoto={details.owner.profilePhoto}
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                                  {details.owner.firstName}{' '}
                                  {details.owner.lastName ?? ''}
                                </p>
                                {details.owner.emailVerified && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                    <FiShield size={10} />
                                    Verified
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#707B8F]">
                                <span className="inline-flex items-center gap-1 truncate">
                                  <FiMail size={11} />
                                  {details.owner.email}
                                </span>
                                {details.owner.phone && (
                                  <span className="inline-flex items-center gap-1">
                                    <FiPhone size={11} />
                                    {details.owner.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onViewOwner(details.owner!.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#263044] bg-[#111722] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] transition hover:border-[#C37DF5]/40 hover:text-[#C37DF5]"
                          >
                            <FiUser size={13} />
                            View Owner
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-[#707B8F]">
                          Owner details unavailable
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents & Review */}
              <div className="rounded-2xl border border-[#263044] bg-[#111722]/70 p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#707B8F]">
                    Uploaded Vehicle Documents ({details.documents.length})
                  </p>
                  <span className="text-[11px] font-semibold text-[#A7B0C0]">
                    {approvedDocsCount}/{details.documents.length} Approved
                  </span>
                </div>

                {details.documents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#263044] bg-[#080B12] p-6 text-center text-xs text-[#707B8F]">
                    No documents uploaded for this vehicle yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {details.documents.map((doc) => {
                      const isBusy = busyDocumentId === doc.id;
                      const isRejecting = rejectingDocId === doc.id;
                      const approved = isDocumentApproved(
                        doc.verificationStatus,
                      );
                      const rejected =
                        doc.verificationStatus.toLowerCase() === 'rejected';

                      return (
                        <div
                          key={doc.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-[#263044] bg-[#080B12] p-4"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <FiFileText
                                  size={15}
                                  className="shrink-0 text-[#C37DF5]"
                                />
                                <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                                  {formatDocumentType(doc.documentType)}
                                </p>
                              </div>
                              <StatusBadge status={doc.verificationStatus} />
                            </div>

                            <div className="space-y-1 text-[11px] text-[#707B8F]">
                              <p className="truncate">
                                File:{' '}
                                <span className="text-[#A7B0C0]">
                                  {doc.originalFileName}
                                </span>
                              </p>
                              <p>
                                Expiry:{' '}
                                <span className="text-[#A7B0C0]">
                                  {formatDate(doc.expiryDate)}
                                </span>
                              </p>
                            </div>

                            {doc.rejectionReason && (
                              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
                                <span className="font-semibold">Reason: </span>
                                {doc.rejectionReason}
                              </div>
                            )}

                            {isRejecting && (
                              <div className="space-y-2 pt-1">
                                <input
                                  type="text"
                                  value={rejectionReason}
                                  onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                  }
                                  placeholder="Enter reason for rejection..."
                                  className="w-full rounded-lg border border-[#263044] bg-[#111722] px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#707B8F] focus:border-[#C37DF5] focus:outline-none"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectingDocId(null);
                                      setRejectionReason('');
                                    }}
                                    className="rounded-lg border border-[#263044] px-2.5 py-1 text-[11px] text-[#A7B0C0] hover:text-[#F8FAFC]"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      void handleConfirmRejectDocument(doc.id)
                                    }
                                    className="rounded-lg bg-red-500/20 px-3 py-1 text-[11px] font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
                                  >
                                    {isBusy ? 'Saving...' : 'Confirm Reject'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Document Actions Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#263044]/70 pt-3">
                            {doc.documentUrl ? (
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C37DF5] transition hover:underline"
                              >
                                <FiExternalLink size={12} />
                                View Document
                              </a>
                            ) : (
                              <span className="text-[11px] text-[#707B8F]">
                                File unavailable
                              </span>
                            )}

                            <div className="flex items-center gap-2">
                              {!approved && (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() =>
                                    void handleApproveDocument(doc)
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                                >
                                  <FiCheck size={12} />
                                  Approve
                                </button>
                              )}

                              {!rejected && !isRejecting && (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => {
                                    setRejectingDocId(doc.id);
                                    setRejectionReason(
                                      doc.rejectionReason ?? '',
                                    );
                                    setActionError('');
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                                >
                                  <FiXCircle size={12} />
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer — Overall Vehicle Decision */}
        {details && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#263044] bg-[#080B12] px-6 py-4">
            <button
              type="button"
              disabled={
                isUpdatingVehicle || details.verificationStatus === 'rejected'
              }
              onClick={() => void handleUpdateVehicleStatus('rejected')}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiXCircle size={15} />
              Reject Vehicle
            </button>

            <button
              type="button"
              disabled={
                isUpdatingVehicle || details.verificationStatus === 'approved'
              }
              onClick={() => void handleUpdateVehicleStatus('approved')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C37DF5] to-[#D56BCF] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiCheckCircle size={15} />
              {isUpdatingVehicle ? 'Updating...' : 'Verify & Approve Vehicle'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
