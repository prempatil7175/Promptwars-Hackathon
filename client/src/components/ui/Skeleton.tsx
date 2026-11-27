export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#E4E6F0] dark:bg-[#2E334B] ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-7 w-24" />
      <Skeleton className="mt-2 h-3 w-40" />
    </div>
  );
}
