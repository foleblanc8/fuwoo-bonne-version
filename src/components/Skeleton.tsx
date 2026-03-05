// src/components/Skeleton.tsx

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <SkeletonBox className="h-40 rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
        <SkeletonBox className="h-3 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <SkeletonBox className="h-5 w-16" />
          <SkeletonBox className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="p-5 border-b last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2 items-center">
            <SkeletonBox className="h-4 w-40" />
            <SkeletonBox className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex gap-4">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-3 w-20" />
          </div>
        </div>
        <SkeletonBox className="h-6 w-14" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-7 w-12" />
      </div>
      <SkeletonBox className="h-9 w-9 rounded-full" />
    </div>
  );
}
