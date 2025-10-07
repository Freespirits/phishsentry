import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateListEntry, useDeleteListEntry, useList } from '../hooks/useLists';

const formSchema = z.object({
  url: z.string().url('Enter a valid URL'),
  reason: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

type ListType = 'block' | 'allow';

function ListTable({ type }: { type: ListType }) {
  const { data, isLoading, isError, error } = useList(type);
  const deleteMutation = useDeleteListEntry(type);

  if (isLoading) {
    return <div className="text-slate-500">Loading {type} list…</div>;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load {type} list: {(error as Error).message}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return <div className="text-slate-500">No entries on the {type} list.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">URL</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Reason</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 text-sm text-slate-700">{item.url}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{item.reason ?? 'N/A'}</td>
              <td className="px-6 py-4 text-right text-sm">
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListForm({ type }: { type: ListType }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const createMutation = useCreateListEntry(type);

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor={`${type}-url`}>
          URL
        </label>
        <input
          id={`${type}-url`}
          type="url"
          {...register('url')}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
        {errors.url ? <p className="text-xs text-red-600">{errors.url.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor={`${type}-reason`}>
          Reason
        </label>
        <textarea
          id={`${type}-reason`}
          rows={3}
          {...register('reason')}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Saving…' : 'Add entry'}
      </button>
    </form>
  );
}

function BlocklistManagerPage() {
  const [activeTab, setActiveTab] = useState<ListType>('block');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Blocklists &amp; Allowlists</h2>
        <p className="text-sm text-slate-500">Manage enforcement lists used by downstream enforcement layers.</p>
      </div>
      <div className="flex gap-2">
        {(['block', 'allow'] as ListType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${
              activeTab === type
                ? 'bg-brand text-white shadow'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type} list
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ListTable type={activeTab} />
        <ListForm type={activeTab} />
      </div>
    </div>
  );
}

export default BlocklistManagerPage;
