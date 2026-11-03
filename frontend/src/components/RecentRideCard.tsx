interface RecentRideCardProps {
  from: string;
  to: string;
  date: string;
  role: 'Driver' | 'Passenger';
  detail: string;
  status: string;
}

export default function RecentRideCard({
  from,
  to,
  date,
  role,
  detail,
  status,
}: RecentRideCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#252e3e] bg-[#080b12] p-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b78ff]/10 text-[#8b78ff]">
          🚗
        </span>

        <div>
          <p className="text-xs font-medium text-white">
            {from} <span className="text-[#8b78ff]">→</span> {to}
          </p>

          <p className="mt-0.5 text-[11px] text-[#929bad]">
            {date} · {role} · {detail}
          </p>
        </div>
      </div>

      <span className="rounded-full bg-[#36e0c0]/10 px-2.5 py-1 text-[10px] font-medium text-[#36e0c0]">
        {status}
      </span>
    </div>
  );
}
