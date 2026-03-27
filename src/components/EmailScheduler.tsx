import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmailCampaigns, approveEmailCampaign, scheduleEmailCampaign } from '../lib/api/email-scheduler';
import { Mail, CheckCircle, Clock, AlertCircle, Plus, Eye, Trash2 } from 'lucide-react';

export function EmailScheduler() {
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['emailCampaigns'],
    queryFn: getEmailCampaigns,
    refetchInterval: 60000, // Cada minuto
    retry: 1
  });

  const approveMutation = useMutation({
    mutationFn: (campaignId: string) => approveEmailCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: (campaignId: string) => scheduleEmailCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
    }
  });

  const pendingCount = campaigns.filter(c => c.status === 'pending').length;
  const approvedCount = campaigns.filter(c => c.status === 'approved').length;
  const sentCount = campaigns.filter(c => c.status === 'sent').length;

  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Scheduler
        </h2>
        <button
          onClick={() => setShowNewCampaign(!showNewCampaign)}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Nueva campaña"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Resumen de estado */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-yellow-50 rounded p-2">
          <p className="text-xs text-gray-600">Pendientes</p>
          <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <p className="text-xs text-gray-600">Aprobadas</p>
          <p className="text-xl font-bold text-blue-600">{approvedCount}</p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <p className="text-xs text-gray-600">Enviadas</p>
          <p className="text-xl font-bold text-green-600">{sentCount}</p>
        </div>
      </div>

      {/* Nueva campaña form */}
      {showNewCampaign && (
        <NewCampaignForm onClose={() => setShowNewCampaign(false)} />
      )}

      {/* Lista de campañas */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin">⏳</div>
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Sin campañas programadas</p>
        ) : (
          campaigns.map((campaign) => (
            <CampaignItem
              key={campaign.id}
              campaign={campaign}
              isSelected={selectedCampaign === campaign.id}
              onSelect={() => setSelectedCampaign(campaign.id)}
              onApprove={() => approveMutation.mutate(campaign.id)}
              onSchedule={() => scheduleMutation.mutate(campaign.id)}
              isApproving={approveMutation.isPending}
              isScheduling={scheduleMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Detalles de campaña seleccionada */}
      {selectedCampaignData && (
        <CampaignDetail campaign={selectedCampaignData} />
      )}
    </div>
  );
}

function CampaignItem({
  campaign,
  isSelected,
  onSelect,
  onApprove,
  onSchedule,
  isApproving,
  isScheduling
}: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      case 'approved': return 'bg-blue-50 border-blue-200';
      case 'sent': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div
      className={`border rounded p-3 cursor-pointer transition ${getStatusColor(campaign.status)} ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          {getStatusIcon(campaign.status)}
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{campaign.name}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {campaign.recipient_count} contactos
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {campaign.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
              disabled={isApproving}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
            >
              Aprobar
            </button>
          )}
          {campaign.status === 'approved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSchedule();
              }}
              disabled={isScheduling}
              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
            >
              Enviar Mañana
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Creada: {new Date(campaign.created_at).toLocaleString('es-CL')}
      </p>
    </div>
  );
}

function CampaignDetail({ campaign }: any) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h3 className="font-semibold text-sm text-gray-900 mb-2">Detalles</h3>
      <div className="space-y-2 text-xs text-gray-600">
        <p><strong>Asunto:</strong> {campaign.subject}</p>
        <p><strong>Estado:</strong> {campaign.status}</p>
        <p><strong>Contactos:</strong> {campaign.recipient_count}</p>
        {campaign.approved_at && (
          <p><strong>Aprobada:</strong> {new Date(campaign.approved_at).toLocaleString('es-CL')}</p>
        )}
        {campaign.scheduled_for && (
          <p><strong>Envío:</strong> {new Date(campaign.scheduled_for).toLocaleString('es-CL')}</p>
        )}
        <div className="mt-3 p-2 bg-gray-100 rounded max-h-20 overflow-y-auto">
          <p className="text-xs whitespace-pre-wrap">{campaign.body}</p>
        </div>
      </div>
    </div>
  );
}

function NewCampaignForm({ onClose }: any) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientCount, setRecipientCount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Llamar a API para crear campaña
    console.log({ name, subject, body, recipientCount });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
      <input
        type="text"
        placeholder="Nombre campaña"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        required
      />
      <input
        type="text"
        placeholder="Asunto"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        required
      />
      <textarea
        placeholder="Cuerpo del email"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        rows={3}
        required
      />
      <input
        type="number"
        placeholder="# contactos"
        value={recipientCount}
        onChange={(e) => setRecipientCount(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        required
      />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          Crear
        </button>
        <button type="button" onClick={onClose} className="flex-1 px-2 py-1 bg-gray-300 text-gray-900 rounded text-sm hover:bg-gray-400">
          Cancelar
        </button>
      </div>
    </form>
  );
}
