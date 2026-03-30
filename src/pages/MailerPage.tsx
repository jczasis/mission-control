import { useState, useEffect } from 'react';
import { Mail, Plus, Eye, Check, X, Clock, AlertCircle, Download, Edit2, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getCampaigns,
  createCampaign,
  approveCampaign,
  scheduleCampaign,
  getRecipients,
  addRecipients,
  getTemplates,
  markAsSent,
  logAction,
  getCampaignHistory,
  type EmailCampaign,
  type EmailRecipient
} from '../lib/api/mailer';

export function MailerPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'new' | 'templates'>('campaigns');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [campaignsData, templatesData] = await Promise.all([
          getCampaigns(),
          getTemplates()
        ]);
        setCampaigns(campaignsData);
        setTemplates(templatesData);
      } catch (err) {
        console.error('Error loading mailer data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleSelectCampaign = async (campaign: EmailCampaign) => {
    try {
      setSelectedCampaign(campaign);
      const [recipientsData, historyData] = await Promise.all([
        getRecipients(campaign.id),
        getCampaignHistory(campaign.id)
      ]);
      setRecipients(recipientsData);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading campaign details:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      case 'sent': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <Eye className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'sent': return <Check className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando mailer...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Infinity Mailer</h1>
            </div>
            <button
              onClick={() => setActiveTab('new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" /> Nueva Campaña
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b border-gray-200">
            {(['campaigns', 'new', 'templates'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 font-medium transition ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'campaigns' && 'Campañas'}
                {tab === 'new' && 'Nueva'}
                {tab === 'templates' && 'Templates'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header con botón atrás */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Infinity Mailer</h1>
          <Link
            to="/"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Dashboard
          </Link>
        </div>

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaigns List */}
            <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Campañas ({campaigns.length})</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {campaigns.map(campaign => (
                  <button
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className={`w-full text-left p-3 hover:bg-gray-50 transition ${
                      selectedCampaign?.id === campaign.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getStatusIcon(campaign.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {campaign.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(campaign.status)}`}>
                            {campaign.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {campaign.recipient_count} contactos
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Details */}
            {selectedCampaign && (
              <div className="lg:col-span-2 space-y-4">
                {/* Resumen */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {selectedCampaign.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase mb-1">Asunto</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedCampaign.subject}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase mb-1">Estado</p>
                      <p className={`inline-block text-xs px-3 py-1 rounded font-semibold ${getStatusColor(selectedCampaign.status)}`}>
                        {selectedCampaign.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedCampaign.recipient_count}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Enviados</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedCampaign.recipient_count - selectedCampaign.bounce_count - selectedCampaign.failed_count}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Entregados</p>
                      <p className="text-lg font-bold text-green-600">
                        {selectedCampaign.delivered_count}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Rebotes</p>
                      <p className="text-lg font-bold text-red-600">
                        {selectedCampaign.bounce_count}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {selectedCampaign.status === 'draft' && (
                      <button
                        onClick={() => {
                          // TODO: Aprobar
                          approveCampaign(selectedCampaign.id, 'juan@grupoempex.com');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <Eye className="w-4 h-4" /> Aprobar para envío
                      </button>
                    )}

                    {selectedCampaign.status === 'approved' && (
                      <button
                        onClick={() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(9, 0, 0, 0);
                          scheduleCampaign(selectedCampaign.id, tomorrow.toISOString());
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                      >
                        <Clock className="w-4 h-4" /> Programar para mañana 09:00
                      </button>
                    )}

                    {selectedCampaign.status === 'scheduled' && (
                      <button
                        onClick={() => {
                          markAsSent(selectedCampaign.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        <Send className="w-4 h-4" /> Marcar como Enviado
                      </button>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Preview</p>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedCampaign.body?.substring(0, 200)}...
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Destinatarios ({recipients.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-3 font-semibold text-gray-900">Email</th>
                          <th className="text-left p-3 font-semibold text-gray-900">Nombre</th>
                          <th className="text-left p-3 font-semibold text-gray-900">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recipients.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-900">{r.email}</td>
                            <td className="p-3 text-gray-600">{r.name || '-'}</td>
                            <td className="p-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                r.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                r.status === 'bounced' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEW CAMPAIGN TAB */}
        {activeTab === 'new' && <NewCampaignForm templates={templates} onSuccess={() => setActiveTab('campaigns')} />}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && <TemplatesView templates={templates} />}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function NewCampaignForm({ templates, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    recipients: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Crear campaña
      const campaign = await createCampaign({
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        html_body: formData.body,
        status: 'draft',
        created_by: 'juan@grupoempex.com',
        recipient_count: 0
      });

      // Parsear destinatarios (email,nombre,empresa)
      const recipientLines = formData.recipients.split('\n').filter(l => l.trim());
      const recipientsData = recipientLines.map(line => {
        const [email, name, company] = line.split(',').map(s => s.trim());
        return { email, name, company, lead_source: 'manual' };
      });

      // Agregar destinatarios
      if (recipientsData.length > 0) {
        await addRecipients(campaign.id, recipientsData);
      }

      await logAction(campaign.id, 'created', 'juan@grupoempex.com', `Campaña creada con ${recipientsData.length} contactos`);

      alert('Campaña creada exitosamente');
      setFormData({ name: '', subject: '', body: '', recipients: '' });
      onSuccess();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Campaña</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Nombre Campaña
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ej: Seguimiento SEIA Marzo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Asunto Email
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ej: VersaSteel: Bodega modular lista en 15 días"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Cuerpo Email
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe el contenido del email..."
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Destinatarios (uno por línea: email,nombre,empresa)
          </label>
          <textarea
            value={formData.recipients}
            onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="contacto@empresa.cl,Juan Pérez,Empresa S.A.&#10;otro@empresa.cl,María González,Empresa S.A."
            rows={8}
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
          >
            {loading ? 'Creando...' : 'Crear Campaña'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TemplatesView({ templates }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template: any) => (
        <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
          <p className="text-xs text-gray-600 mt-1">{template.category}</p>
          <p className="text-sm text-gray-700 mt-3">{template.subject}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Usar este template
          </button>
        </div>
      ))}
    </div>
  );
}

function Calendar() {
  return <Clock className="w-4 h-4" />;
}
