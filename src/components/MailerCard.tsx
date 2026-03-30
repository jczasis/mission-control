import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { getScheduledTomorrow, getMailerStats } from '../lib/api/mailer';

interface ScheduledEmail {
  id: string;
  name: string;
  subject: string;
  recipient_count: number;
  scheduled_for: string;
}

interface Stats {
  pending_approval: number;
  scheduled_campaigns: number;
  total_delivered: number;
  total_bounced: number;
}

export function MailerCard() {
  const [scheduled, setScheduled] = useState<ScheduledEmail[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending_approval: 0,
    scheduled_campaigns: 0,
    total_delivered: 0,
    total_bounced: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [scheduledData, statsData] = await Promise.all([
          getScheduledTomorrow(),
          getMailerStats()
        ]);

        setScheduled(scheduledData);
        setStats({
          pending_approval: statsData.pending_approval || 0,
          scheduled_campaigns: statsData.scheduled_campaigns || 0,
          total_delivered: statsData.total_delivered || 0,
          total_bounced: statsData.total_bounced || 0
        });
      } catch (err: any) {
        console.error('Error fetching mailer data:', err);
        setError(err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Infinity Mailer
        </h2>
        <Link
          to="/mailer"
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          title="Abrir panel de control completo"
        >
          Abrir <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-yellow-50 rounded p-2">
          <p className="text-xs text-gray-600">Pendientes aprobación</p>
          <p className="text-lg font-bold text-yellow-600">
            {loading ? '—' : stats.pending_approval}
          </p>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <p className="text-xs text-gray-600">Scheduled</p>
          <p className="text-lg font-bold text-blue-600">
            {loading ? '—' : stats.scheduled_campaigns}
          </p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <p className="text-xs text-gray-600">Entregados</p>
          <p className="text-lg font-bold text-green-600">
            {loading ? '—' : stats.total_delivered}
          </p>
        </div>
        <div className="bg-red-50 rounded p-2">
          <p className="text-xs text-gray-600">Rebotes</p>
          <p className="text-lg font-bold text-red-600">
            {loading ? '—' : stats.total_bounced}
          </p>
        </div>
      </div>

      {/* Mañana's Scheduled Emails */}
      <div className="border-t border-gray-200 pt-3 flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          📅 Mañana
        </h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-pulse text-gray-400">Cargando...</div>
          </div>
        ) : scheduled.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-3">
            Sin campañas programadas para mañana
          </p>
        ) : (
          <div className="space-y-2">
            {scheduled.map((campaign) => (
              <div
                key={campaign.id}
                className="p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition cursor-pointer"
              >
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {campaign.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {campaign.subject}
                </p>
                <div className="flex justify-between items-end mt-1.5">
                  <p className="text-xs text-gray-500">
                    {campaign.recipient_count} contactos
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    {new Date(campaign.scheduled_for).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Quick action */}
      {scheduled.length > 0 && (
        <div className="border-t border-gray-200 pt-2 mt-2 text-xs text-gray-600">
          <p>✓ {scheduled.length} {scheduled.length === 1 ? 'campaña' : 'campañas'} listas para mañana</p>
        </div>
      )}
    </div>
  );
}
