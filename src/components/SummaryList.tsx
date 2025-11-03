import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { SummaryListSkeleton } from './Skeleton';

interface SummaryListProps {
  onSelectSummary: (id: string) => void;
}

export function SummaryList({ onSelectSummary }: SummaryListProps) {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const response = await api.summaries.getAll();
      setSummaries(response.data);
    } catch (error) {
      console.error('Failed to load summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SummaryListSkeleton />;
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Summaries Yet</h2>
        <p className="text-slate-600">Process some newsletters to see summaries here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Newsletter Summaries</h1>

      <div className="bg-white shadow rounded-lg divide-y divide-slate-200">
        {summaries.map((summary) => (
          <button
            key={summary.id}
            onClick={() => onSelectSummary(summary.id)}
            className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {summary.exported_to_kb ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                )}
                <h3 className="text-lg font-medium text-slate-900 truncate">
                  {summary.newsletter?.subject || 'Untitled'}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{summary.newsletter?.sender || 'Unknown'}</span>
                <span>•</span>
                <span>{new Date(summary.created_at).toLocaleDateString()}</span>
                {summary.processing_time_ms && (
                  <>
                    <span>•</span>
                    <span>{(summary.processing_time_ms / 1000).toFixed(1)}s processing time</span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 ml-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
