import { useModelMetrics } from '../hooks/useFeedStats';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ModelMetricsPage() {
  const { data, isLoading, isError, error } = useModelMetrics();

  if (isLoading) {
    return <div className="text-slate-500">Loading model metrics…</div>;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load model metrics: {(error as Error).message}
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-500">No model metrics available.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Detection Model Performance</h2>
        <p className="text-sm text-slate-500">Track model health to identify drift and regression.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Precision" value={(data.precision * 100).toFixed(1) + '%'} />
        <MetricCard label="Recall" value={(data.recall * 100).toFixed(1) + '%'} />
        <MetricCard label="F1 Score" value={(data.f1 * 100).toFixed(1) + '%'} />
        <MetricCard label="AUC" value={data.auc.toFixed(3)} />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Model Details</h3>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600">
          <div>
            <dt className="font-medium text-slate-500">Version</dt>
            <dd className="text-slate-900">{data.modelVersion}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Last Updated</dt>
            <dd className="text-slate-900">{new Date(data.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default ModelMetricsPage;
