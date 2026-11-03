interface PreferenceItemProps {
  label: string;
  value?: string;
}

export default function PreferenceItem({ label, value }: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#252e3e] pb-2.5 text-xs">
      <span className="text-[#929bad]">{label}</span>
      <span className="rounded-full border border-[#30394b] bg-[#161b27] px-2.5 py-1 text-[11px] text-white">
        {value || 'No preference'}
      </span>
    </div>
  );
}
