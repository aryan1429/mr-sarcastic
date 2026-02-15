import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-shimmer before:bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}

// Chat page skeleton
const ChatSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[120px]" />
      </div>
    </div>
    <div className="space-y-4 mt-6">
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="space-y-2 max-w-[70%]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <div className="space-y-2 max-w-[60%]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      </div>
    </div>
    <div className="mt-6 flex gap-2">
      <Skeleton className="h-10 flex-1 rounded-xl" />
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
  </div>
);

// Song card skeleton
const SongCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-border/50 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[60%]" />
        <Skeleton className="h-3 w-[40%]" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  </div>
);

// Songs grid skeleton
const SongsGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <SongCardSkeleton key={i} />
    ))}
  </div>
);

// Profile skeleton
const ProfileSkeleton = () => (
  <div className="space-y-6 p-4 max-w-2xl mx-auto">
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="h-6 w-[200px]" />
      <Skeleton className="h-4 w-[160px]" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-2 p-4 rounded-xl border border-border/50">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-[60%] rounded-xl" />
    </div>
  </div>
);

export { Skeleton, ChatSkeleton, SongCardSkeleton, SongsGridSkeleton, ProfileSkeleton };
