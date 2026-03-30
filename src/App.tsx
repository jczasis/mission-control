import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Evangelio } from './components/Evangelio';
import { PolymarketCards } from './components/Polymarket';
import { GmailTasks } from './components/GmailTasks';
import { Metricas } from './components/Metricas';
import { CronStatus } from './components/CronStatus';
import { EmailScheduler } from './components/EmailScheduler';
import { MailerPage } from './pages/MailerPage';
import { Mail } from 'lucide-react';
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/mailer" element={<MailerPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mission Control</h1>
            <p className="text-gray-400">Dashboard de operaciones VersaSteel & EMPEX</p>
          </div>
          <Link
            to="/mailer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Mail size={20} />
            Infinity Mailer
          </Link>
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
  );
}

export default App;
