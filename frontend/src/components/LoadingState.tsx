import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Loading...',
}: LoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle size={28} className="animate-spin text-[#36e0c0]" />

      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
