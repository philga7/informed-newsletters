import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ArrowLeft, Copy, Check, ExternalLink, CheckCircle2, Circle } from 'lucide-react';

interface SummaryDetailProps {
  summaryId: string;
  onBack: () => void;
}

export function SummaryDetail({ summaryId, onBack }: SummaryDetailProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [summaryId]);

  const loadSummary = async () => {
    try {
      const response = await api.summaries.getById(summaryId);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary.markdown_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleExported = async () => {
    if (!summary) return;

    try {
      await api.summaries.updateExportStatus(summaryId, !summary.exported_to_kb);
      setSummary({ ...summary, exported_to_kb: !summary.exported_to_kb });
    } catch (error) {
      console.error('Failed to update export status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Summary Not Found</h2>
        <button onClick={onBack} className="text-slate-600 hover:text-slate-900">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Summaries
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {summary.newsletter?.subject || 'Untitled'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{summary.newsletter?.sender || 'Unknown'}</span>
              <span>•</span>
              <span>{new Date(summary.newsletter?.received_at).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleExported}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                summary.exported_to_kb
                  ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {summary.exported_to_kb ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Exported
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 mr-2" />
                  Mark as Exported
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800"
            >
              {copied ? (
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
        </div>

        <div className="prose max-w-none border-t pt-6">
          <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-lg">
            {summary.markdown_content}
          </div>
        </div>
      </div>

      {summary.links && summary.links.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Extracted Links ({summary.links.length})</h2>
          <div className="space-y-3">
            {summary.links.map((link: any) => (
              <div key={link.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 mb-2">{link.associated_text}</p>
                    <div className="space-y-1">
                      {link.final_url ? (
                        <a
                          href={link.final_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{link.final_url}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 font-medium">Resolution Failed</span>
                          <a
                            href={link.beehiiv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-500 hover:text-slate-700 truncate"
                          >
                            {link.beehiiv_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      link.resolution_status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {link.resolution_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Original Newsletter</h2>
        <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-auto">
          <div
            className="prose max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: summary.newsletter?.html_content || '' }}
          />
        </div>
      </div>
    </div>
  );
}
