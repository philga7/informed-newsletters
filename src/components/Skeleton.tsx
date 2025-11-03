export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-9 w-48 bg-slate-200 rounded"></div>
        <div className="h-10 w-40 bg-slate-200 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="h-6 w-6 bg-slate-200 rounded"></div>
                <div className="ml-5 flex-1 space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-8 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-40 bg-slate-200 rounded"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="h-20 w-full bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function SummaryListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 w-64 bg-slate-200 rounded mb-6"></div>
      <div className="bg-white shadow rounded-lg divide-y divide-slate-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AggregatedSummariesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 w-72 bg-slate-200 rounded mb-6"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-slate-200 rounded"></div>
                    <div className="h-6 w-48 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-4 w-40 bg-slate-200 rounded"></div>
                </div>
                <div className="h-10 w-40 bg-slate-200 rounded-md"></div>
              </div>
              <div className="h-64 w-full bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-32 bg-slate-200 rounded mb-6"></div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-56 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div>
            <div className="h-4 w-40 bg-slate-200 rounded mb-2"></div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-slate-200 rounded-md"></div>
              <div className="h-10 w-32 bg-slate-200 rounded-md"></div>
            </div>
          </div>
          <div>
            <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
            <div className="h-10 w-full bg-slate-200 rounded-md"></div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-40 bg-slate-200 rounded mb-2"></div>
              <div className="h-10 w-full bg-slate-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-56 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-full bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="h-12 w-56 bg-slate-200 rounded-md"></div>
      </div>
    </div>
  );
}

export function ProcessingLogsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-9 w-56 bg-slate-200 rounded"></div>
        <div className="h-10 w-40 bg-slate-200 rounded-md"></div>
      </div>

      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border-l-4 border-slate-200 shadow rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  <div className="h-4 w-40 bg-slate-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
