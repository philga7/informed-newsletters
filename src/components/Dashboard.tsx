import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { RefreshCw, Mail, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { DashboardSkeleton } from './Skeleton';

interface DashboardProps {
  onViewSummaries: () => void;
}

export function Dashboard({ onViewSummaries }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [logsResponse, newslettersResponse, summariesResponse] = await Promise.all([
        api.logs.getStats(),
        api.newsletters.getAll(),
        api.summaries.getAll(),
      ]);

      setStats({
        ...logsResponse.data,
        pendingNewsletters: newslettersResponse.data.filter((n: any) => n.processed_status === 'pending').length,
        totalSummaries: summariesResponse.data.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualProcess = async () => {
    setProcessing(true);
    try {
      await api.newsletters.triggerProcess();
      setTimeout(() => {
        loadStats();
        setProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to trigger processing:', error);
      setProcessing(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <button
          onClick={handleManualProcess}
          disabled={processing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
          {processing ? 'Processing...' : 'Process Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Newsletters</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats?.totalNewsletters || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileCheck className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Processed</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats?.processedNewsletters || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Pending</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats?.pendingNewsletters || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Errors</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats?.errorCount || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Last Processing Run</span>
            <span className="text-sm font-medium text-slate-900">
              {stats?.lastRunAt ? new Date(stats.lastRunAt).toLocaleString() : 'Never'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Total Summaries</span>
            <span className="text-sm font-medium text-slate-900">{stats?.totalSummaries || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Scheduled Runs</span>
            <span className="text-sm font-medium text-slate-900">6:00 AM, 6:00 PM (EST)</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button
            onClick={onViewSummaries}
            className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="font-medium text-slate-900">View All Summaries</div>
            <div className="text-sm text-slate-500 mt-1">Browse and copy processed newsletter summaries</div>
          </button>
        </div>
      </div>
    </div>
  );
}
