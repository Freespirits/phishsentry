import { useFeedStats } from '../hooks/useFeedStats';

function FeedStatisticsPage() {
  const { data, isLoading, isError, error } = useFeedStats();

  if (isLoading) {
    return <div className="text-slate-500">Loading feed statistics…</div>;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load feed statistics: {(error as Error).message}
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-500">No feed statistics available.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Feed Intelligence</h2>
        <p className="text-sm text-slate-500">Understand ingestion volume, coverage, and provider contributions.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total URLs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totalUrls.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Unique last 24h</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{data.uniques24h.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Providers</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{data.providers.length}</p>
        </div>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Provider Breakdown</h3>
        <div className="mt-4 space-y-3">
          {data.providers.map((provider) => (
            <div key={provider.name} className="flex items-center justify-between text-sm text-slate-600">
              <span>{provider.name}</span>
              <span className="font-medium text-slate-900">{provider.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FeedStatisticsPage;
