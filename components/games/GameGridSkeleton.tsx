import { Skeleton } from "@/components/ui/skeleton"

export function GameGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden"
        >
          <Skeleton className="aspect-[16/9]" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 