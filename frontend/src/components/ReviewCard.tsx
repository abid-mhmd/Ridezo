import { Star } from 'lucide-react';

interface ReviewCardProps {
  initials: string;
  reviewerName: string;
  journey: string;
  review: string;
  rating: number;
}

export default function ReviewCard({
  initials,
  reviewerName,
  journey,
  review,
  rating,
}: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-[#252e3e] bg-[#080b12] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b2030] text-xs font-semibold text-[#b6a8ff]">
            {initials}
          </span>
          <div>
            <p className="text-xs font-medium text-white">{reviewerName}</p>
            <p className="text-[10px] text-[#929bad]">{journey}</p>
          </div>
        </div>

        <div className="flex text-amber-400">
          {Array.from({ length: rating }).map((_, index) => (
            <Star key={index} size={12} className="fill-amber-400" />
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#c7cddd]">
        {review}
      </p>
    </div>
  );
}