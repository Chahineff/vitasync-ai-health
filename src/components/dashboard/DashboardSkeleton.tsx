import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-white/10" />
        <Skeleton className="h-4 w-40 bg-white/10" />
      </div>
      
      {/* Widget skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl bg-white/10" />
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full rounded-2xl bg-white/10" />
        <Skeleton className="h-64 w-full rounded-2xl bg-white/10" />
      </div>
    </div>
  );
};
