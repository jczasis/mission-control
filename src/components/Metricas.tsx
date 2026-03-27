import { useQuery } from '@tanstack/react-query';
import { getInfinityBoxMetrics, getEmpexMetrics, getSEIAMetrics } from '../lib/api/supabase';
import { Mail, Building2, Briefcase, TrendingUp, Loader2 } from 'lucide-react';

export function Metricas() {
  const { data: infinityMetrics, isLoading: infinityLoading } = useQuery({
    queryKey: ['infinityMetrics'],
    queryFn: getInfinityBoxMetrics,
    refetchInterval: 60 * 60 * 1000, // Cada hora
    retry: 1
  });

  const { data: empexMetrics, isLoading: empexLoading } = useQuery({
    queryKey: ['empexMetrics'],
    queryFn: getEmpexMetrics,
    refetchInterval: 60 * 60 * 1000,
    retry: 1
  });

  const { data: seiaMetrics, isLoading: seiaLoading } = useQuery({
    queryKey: ['seiaMetrics'],
    queryFn: getSEIAMetrics,
    refetchInterval: 60 * 60 * 1000,
    retry: 1
  });

  const isLoading = infinityLoading || empexLoading || seiaLoading;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Métricas Operacionales</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Infinity Box */}
          <MetricCard
            title="InfinityBox"
            icon={<Mail className="w-5 h-5" />}
            metrics={[
              {
                label: 'Emails hoy',
                value: infinityMetrics.emailsSentToday,
                unit: ''
              },
              {
                label: 'Open Rate',
                value: infinityMetrics.openRate,
                unit: '%'
              },
              {
                label: 'Conversiones',
                value: infinityMetrics.conversions,
                unit: ''
              }
            ]}
          />

          {/* EMPEX */}
          <MetricCard
            title="EMPEX"
            icon={<Building2 className="w-5 h-5" />}
            metrics={[
              {
                label: 'Galpones encontrados',
                value: empexMetrics.galponesFoundToday,
                unit: ''
              },
              {
                label: 'Cotizaciones enviadas',
                value: empexMetrics.cotizacionesSent,
                unit: ''
              },
              {
                label: 'Leads activos',
                value: empexMetrics.leadsActivos,
                unit: ''
              }
            ]}
          />

          {/* SEIA */}
          <MetricCard
            title="SEIA"
            icon={<Briefcase className="w-5 h-5" />}
            metrics={[
              {
                label: 'Proyectos hoy',
                value: seiaMetrics.newProjectsToday,
                unit: ''
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: Array<{ label: string; value: number; unit: string }>;
}

function MetricCard({ title, icon, metrics }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <div>
              <span className="text-xl font-bold text-gray-900">
                {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
              </span>
              <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
