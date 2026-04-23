import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface px-6 pb-24 pt-8 md:px-12 md:pb-12 md:pt-12">
      <header className="mb-10 flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32 bg-surface-container-high" />
          <Skeleton className="h-9 w-44 bg-surface-container-high" />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Skeleton className="h-10 w-10 rounded-full bg-surface-container-high" />
          <Skeleton className="h-10 w-10 rounded-full bg-surface-container-high" />
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl bg-surface-container-high" />
            <Skeleton className="h-56 w-full rounded-2xl bg-surface-container-high" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl bg-surface-container-high" />
            <Skeleton className="h-48 w-full rounded-2xl bg-surface-container-high" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-28 w-full rounded-2xl bg-surface-container-high" />
          <Skeleton className="h-28 w-full rounded-2xl bg-surface-container-high" />
          <Skeleton className="h-28 w-full rounded-2xl bg-surface-container-high" />
        </div>
      </div>
    </div>
  )
}
