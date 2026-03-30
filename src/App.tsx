import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Evangelio } from './components/Evangelio';
import { PolymarketCards } from './components/Polymarket';
import { GmailTasks } from './components/GmailTasks';
import { Metricas } from './components/Metricas';
import { CronStatus } from './components/CronStatus';
import { EmailScheduler } from './components/EmailScheduler';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Mission Control</h1>
            <p className="text-gray-400">Dashboard de operaciones VersaSteel & EMPEX</p>
          </header>

          {/* Layout principal: 4 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Columna izquierda: Evangelio + Polymarket */}
            <div className="lg:col-span-1 space-y-6">
              <div className="h-64">
                <Evangelio />
              </div>
            </div>

            {/* Columna central: Polymarket + Métricas */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <PolymarketCards />
              </div>
              <div>
                <Metricas />
              </div>
            </div>

            {/* Columna derecha: Tareas */}
            <div className="lg:col-span-1">
              <div className="h-full min-h-96">
                <GmailTasks />
              </div>
            </div>

            {/* Columna Email Scheduler */}
            <div className="lg:col-span-1">
              <div className="h-full min-h-96">
                <EmailScheduler />
              </div>
            </div>
          </div>

          {/* Fila inferior: Cron Status */}
          <div className="mt-6">
            <CronStatus />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
// force rebuild 1774910008748211210
