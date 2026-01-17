export const StoreTransactionSkeleton = () => (
  <div className="bg-white rounded-xl p-5 shadow-md border animate-pulse">
    <div className="flex justify-between items-center border-b pb-3 mb-3">
      <div className="space-y-2">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-28 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-5 bg-gray-200 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="h-3 w-36 bg-gray-200 rounded" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

const SkeletonBox = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export const TransactionsSkeleton = () => (
  <div className="min-h-screen w-full bg-gray-100 pb-10">
    <div className="bg-white shadow-md px-6 py-4 flex justify-between">
      <SkeletonBox className="h-6 w-48" />
      <SkeletonBox className="h-9 w-32" />
    </div>

    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border space-y-3">
        <SkeletonBox className="h-5 w-56" />
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="h-4 w-full" />
        ))}
        <SkeletonBox className="h-8 w-32 ml-auto" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
        <SkeletonBox className="h-5 w-40" />
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonBox className="h-56 w-full" />
          <SkeletonBox className="h-6 w-48" />
        </div>
      </div>

      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border">
          <SkeletonBox className="h-10 w-full rounded-none" />
          <SkeletonBox className="h-56 w-full" />
          <div className="p-4 space-y-2">
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
);