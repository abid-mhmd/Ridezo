import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={isLoading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#252e3e] bg-[#111722] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <AlertTriangle size={18} />
            </span>
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-[#929bad] hover:text-white disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#c7cddd]">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-[#252e3e] bg-[#080b12] px-4 py-2 text-xs font-medium text-[#c7cddd] transition hover:text-white disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Cancelling...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
