import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Copy, Check, Layers } from 'lucide-react';
import { AggregatedSummariesSkeleton } from './Skeleton';

export function AggregatedSummaries() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const response = await api.aggregated.getAll();
      setSummaries(response.data);
    } catch (error) {
      console.error('Failed to load aggregated summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return <AggregatedSummariesSkeleton />;
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Aggregated Summaries Yet</h2>
        <p className="text-slate-600">Aggregated summaries are created automatically when processing multiple newsletters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Aggregated Summaries</h1>

      <div className="space-y-4">
        {summaries.map((summary) => {
          const isExpanded = expandedId === summary.id;
          const newsletters = summary.aggregations?.map((agg: any) => agg.newsletter) || [];

          return (
            <div key={summary.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-5 w-5 text-slate-400" />
                      <h2 className="text-xl font-semibold text-slate-900">
                        {new Date(summary.date_range_start).toLocaleDateString()} -{' '}
                        {new Date(summary.date_range_end).toLocaleDateString()}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-500">
                      {summary.newsletter_count} newsletters aggregated
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(summary.id, summary.markdown_content)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800"
                  >
                    {copiedId === summary.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Markdown
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : summary.id)}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {isExpanded ? 'Hide' : 'Show'} source newsletters ({newsletters.length})
                  </button>
                  {isExpanded && newsletters.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {newsletters.map((newsletter: any) => (
                        <div key={newsletter.id} className="text-sm bg-slate-50 p-3 rounded">
                          <div className="font-medium text-slate-900">{newsletter.subject}</div>
                          <div className="text-slate-500">{newsletter.sender}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-lg max-h-96 overflow-auto">
                    {summary.markdown_content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
