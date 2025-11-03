import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Save } from 'lucide-react';
import { SettingsSkeleton } from './Skeleton';

export function Settings() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.config.getAll();
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.config.update('cron_schedule', config.cron_schedule),
        api.config.update('ollama_rate_limit_ms', config.ollama_rate_limit_ms),
        api.config.update('link_resolution_timeout_ms', config.link_resolution_timeout_ms),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Scheduling Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Processing Times
            </label>
            <div className="flex gap-3">
              {config.cron_schedule?.times?.map((time: string, index: number) => (
                <input
                  key={index}
                  type="time"
                  value={time}
                  onChange={(e) => {
                    const newTimes = [...config.cron_schedule.times];
                    newTimes[index] = e.target.value;
                    setConfig({
                      ...config,
                      cron_schedule: { ...config.cron_schedule, times: newTimes },
                    });
                  }}
                  className="block px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Times when the system will automatically check for new newsletters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <input
              type="text"
              value={config.cron_schedule?.timezone || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cron_schedule: { ...config.cron_schedule, timezone: e.target.value },
                })
              }
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
              placeholder="America/New_York"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ollama Rate Limit (ms)
            </label>
            <input
              type="number"
              value={config.ollama_rate_limit_ms || 1000}
              onChange={(e) =>
                setConfig({ ...config, ollama_rate_limit_ms: parseInt(e.target.value) })
              }
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            />
            <p className="mt-2 text-sm text-slate-500">
              Minimum time between AI API calls to respect rate limits
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link Resolution Timeout (ms)
            </label>
            <input
              type="number"
              value={config.link_resolution_timeout_ms || 10000}
              onChange={(e) =>
                setConfig({ ...config, link_resolution_timeout_ms: parseInt(e.target.value) })
              }
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            />
            <p className="mt-2 text-sm text-slate-500">
              Maximum time to wait for link resolution before timing out
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Environment Configuration</h2>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Server-side environment variables must be configured in the <code className="bg-slate-100 px-2 py-1 rounded text-xs">.env</code> file:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="bg-slate-100 px-2 py-1 rounded text-xs">GMAIL_CREDENTIALS</code> - OAuth credentials JSON</li>
            <li><code className="bg-slate-100 px-2 py-1 rounded text-xs">GMAIL_TOKEN</code> - OAuth token JSON</li>
            <li><code className="bg-slate-100 px-2 py-1 rounded text-xs">OLLAMA_API_KEY</code> - API key for Ollama Cloud</li>
            <li><code className="bg-slate-100 px-2 py-1 rounded text-xs">OLLAMA_MODEL</code> - Model name (default: deepseek-v3.1:671b)</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Restart the server after updating environment variables for changes to take effect.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
