import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SummaryList } from './components/SummaryList';
import { SummaryDetail } from './components/SummaryDetail';
import { AggregatedSummaries } from './components/AggregatedSummaries';
import { Settings } from './components/Settings';
import { ProcessingLogs } from './components/ProcessingLogs';
import { FileText, List, Settings as SettingsIcon, Activity, Layers } from 'lucide-react';

type View = 'dashboard' | 'summaries' | 'aggregated' | 'settings' | 'logs';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);

  useEffect(() => {
    if (currentView !== 'summaries') {
      setSelectedSummaryId(null);
    }
  }, [currentView]);

  const renderView = () => {
    if (currentView === 'summaries' && selectedSummaryId) {
      return <SummaryDetail summaryId={selectedSummaryId} onBack={() => setSelectedSummaryId(null)} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewSummaries={() => setCurrentView('summaries')} />;
      case 'summaries':
        return <SummaryList onSelectSummary={setSelectedSummaryId} />;
      case 'aggregated':
        return <AggregatedSummaries />;
      case 'settings':
        return <Settings />;
      case 'logs':
        return <ProcessingLogs />;
      default:
        return <Dashboard onViewSummaries={() => setCurrentView('summaries')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="h-8 w-8 text-slate-700" />
                <span className="ml-2 text-xl font-semibold text-slate-900">Newsletter Aggregator</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'dashboard'
                      ? 'border-slate-700 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('summaries')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'summaries'
                      ? 'border-slate-700 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Summaries
                </button>
                <button
                  onClick={() => setCurrentView('aggregated')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'aggregated'
                      ? 'border-slate-700 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Aggregated
                </button>
                <button
                  onClick={() => setCurrentView('logs')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'logs'
                      ? 'border-slate-700 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Logs
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'settings'
                      ? 'border-slate-700 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
