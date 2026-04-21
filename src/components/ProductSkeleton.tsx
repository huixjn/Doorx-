import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-[4/5] bg-neutral-100 animate-pulse rounded-2xl" />
      <div className="space-y-2">
        <div className="h-6 bg-neutral-100 animate-pulse rounded-lg w-3/4" />
        <div className="h-4 bg-neutral-100 animate-pulse rounded-lg w-1/4" />
      </div>
      <div className="h-10 bg-neutral-100 animate-pulse rounded-xl w-full" />
    </div>
  );
}
