import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AlertCircle, Info, AlertTriangle, Filter } from 'lucide-react';
import { ProcessingLogsSkeleton } from './Skeleton';

type LogType = 'all' | 'info' | 'warning' | 'error';

export function ProcessingLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LogType>('all');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      const response = await api.logs.getAll(100, filter === 'all' ? undefined : filter);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (loading) {
    return <ProcessingLogsSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Processing Logs</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogType)}
            className="block px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          >
            <option value="all">All Logs</option>
            <option value="info">Info</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-slate-600">No logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`bg-white border-l-4 shadow rounded-lg p-4 ${getLogColor(log.log_type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.log_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {log.operation}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900">{log.message}</p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                        View details
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border border-slate-200 overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
