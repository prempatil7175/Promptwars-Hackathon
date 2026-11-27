export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#EEF0F7] dark:bg-[#23263B] ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-7 w-24" />
      <Skeleton className="mt-2 h-3 w-40" />
    </div>
  );
}
