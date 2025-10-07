import { useParams, Link } from 'react-router-dom';
import { useAlertDetail } from '../hooks/useAlerts';

function UrlDetailPage() {
  const { alertId } = useParams<{ alertId: string }>();
  const { data, isLoading, isError, error } = useAlertDetail(alertId);

  if (isLoading) {
    return <div className="text-slate-500">Loading alert details…</div>;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load alert detail: {(error as Error).message}
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-500">Alert not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Alert {data.id}</h2>
          <p className="text-sm text-slate-500">Detailed intelligence and enrichment for the suspicious URL.</p>
        </div>
        <Link
          to="/alerts"
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Back to alerts
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">URL Overview</h3>
            <p className="text-sm text-slate-500">Primary metadata for the detection.</p>
          </div>
          <dl className="grid gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-500">URL</dt>
              <dd className="truncate text-slate-900" title={data.url}>
                {data.url}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="font-medium text-slate-500">Severity</dt>
                <dd className="text-slate-900 capitalize">{data.severity}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Status</dt>
                <dd className="text-slate-900 capitalize">{data.status}</dd>
              </div>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Detected</dt>
              <dd className="text-slate-900">{new Date(data.detectedAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Reporter</dt>
              <dd className="text-slate-900">{data.reporter}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Tags</dt>
              <dd className="flex flex-wrap gap-2">
                {data.tags.length > 0 ? (
                  data.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">No tags</span>
                )}
              </dd>
            </div>
          </dl>
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Intelligence Enrichment</h3>
            <p className="text-sm text-slate-500">Derived signals used for scoring.</p>
          </div>
          <dl className="grid gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-500">Brand</dt>
              <dd className="text-slate-900">{data.intelligence.brand ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Tactic / Technique</dt>
              <dd className="text-slate-900">{data.intelligence.ttp ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Confidence</dt>
              <dd className="text-slate-900">
                {data.intelligence.confidence ? `${Math.round(data.intelligence.confidence * 100)}%` : 'N/A'}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Redirect Chain</h3>
          <p className="text-sm text-slate-500">Landing paths observed during detonation.</p>
        </div>
        <ol className="space-y-2 text-sm text-slate-600">
          {data.redirectChain.length > 0 ? (
            data.redirectChain.map((url) => (
              <li key={url} className="truncate rounded-md bg-slate-100 px-3 py-2" title={url}>
                {url}
              </li>
            ))
          ) : (
            <li className="text-slate-400">No redirects observed.</li>
          )}
        </ol>
      </section>
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Related Alerts</h3>
          <p className="text-sm text-slate-500">Other signals referencing the same campaign or infrastructure.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.relatedAlerts.length > 0 ? (
            data.relatedAlerts.map((related) => (
              <Link
                to={`/alerts/${related.id}`}
                key={related.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 transition hover:border-brand hover:bg-white hover:text-slate-900"
              >
                <p className="font-semibold text-slate-900">{related.id}</p>
                <p className="capitalize">Severity: {related.severity}</p>
                <p className="capitalize">Status: {related.status}</p>
              </Link>
            ))
          ) : (
            <p className="text-slate-400">No related alerts.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default UrlDetailPage;
