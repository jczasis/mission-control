import { useQuery } from '@tanstack/react-query';
import { getCronJobs } from '../lib/api/supabase';
import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

export function CronStatus() {
  const { data: cronJobs = [], isLoading } = useQuery({
    queryKey: ['cronJobs'],
    queryFn: getCronJobs,
    refetchInterval: 60 * 1000, // Cada minuto
    retry: 1
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Estado Cron Jobs</h2>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      ) : cronJobs.length === 0 ? (
        <p className="text-gray-500 text-sm">Sin cron jobs registrados</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cronJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="mt-0.5 flex-shrink-0">
                {job.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : job.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-gray-900 text-sm">{job.name}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      job.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {job.status === 'success'
                      ? 'Exitoso'
                      : job.status === 'error'
                      ? 'Error'
                      : 'Pendiente'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Última ejecución: {formatTime(job.lastRun)}
                </div>

                {job.errorMessage && (
                  <div className="text-xs text-red-600 mt-1 p-2 bg-red-50 rounded">
                    {job.errorMessage}
                  </div>
                )}

                {job.nextRun && (
                  <div className="text-xs text-gray-500 mt-1">
                    Próxima: {formatTime(job.nextRun)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 30) return `Hace ${diffDays}d`;

    return date.toLocaleDateString('es-CL', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}
