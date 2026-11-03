import { CheckCircle2, CircleAlert } from 'lucide-react';

interface VerificationStatusProps {
  isVerified: boolean;
}

export default function VerificationStatus({
  isVerified,
}: VerificationStatusProps) {
  return isVerified ? (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#36e0c0]">
      <CheckCircle2 size={13} />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
      <CircleAlert size={13} />
      Not verified
    </span>
  );
}
