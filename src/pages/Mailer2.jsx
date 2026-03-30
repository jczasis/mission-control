import { useState, useEffect } from 'react';

export default function Mailer2() {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = 'https://lirzzskabepwdlhvdmla.supabase.co/rest/v1';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcnp6c2thYmVwd2RsaHZkbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDExMjcsImV4cCI6MjA4Nzg3NzEyN30.RDl7rokWNnW5nrPDFVndHwWd9rNv8Wr42M4V6SJbgKw';

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    setLoading(true);
    fetch(`${API}/email_campaigns?order=created_at.desc`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
    })
      .then(r => r.json())
      .then(data => {
        setCampaigns(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const selectCampaign = (id) => {
    const campaign = campaigns.find(c => c.id === id);
    setSelected(campaign);

    fetch(`${API}/email_recipients?campaign_id=eq.${id}&select=*`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
    })
      .then(r => r.json())
      .then(setRecipients);
  };

  const approveCampaign = (id) => {
    if (!confirm('¿Aprobar esta campaña?')) return;

    fetch(`${API}/email_campaigns?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
    })
      .then(() => {
        alert('✅ Campaña aprobada');
        loadCampaigns();
      })
      .catch(err => alert('Error: ' + err.message));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">📧 Infinity Mailer</h1>
          <p className="text-sm text-gray-500 mt-1">Aprobación de campañas de email</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de campañas */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
              Campañas ({campaigns.length})
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {campaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => selectCampaign(c.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    selected?.id === c.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: <span className={`font-bold ${c.status === 'draft' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Contactos: {c.recipient_count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Detalles de campaña */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
                Selecciona una campaña para ver detalles
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selected.name}</h2>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="text-center bg-gray-50 p-4 rounded">
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{selected.recipient_count}</p>
                  </div>
                  <div className="text-center bg-gray-50 p-4 rounded">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className={`text-sm font-bold ${selected.status === 'draft' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {selected.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-center bg-gray-50 p-4 rounded">
                    <p className="text-xs text-gray-600 mb-1">Creado</p>
                    <p className="text-xs font-bold text-gray-900">
                      {new Date(selected.created_at).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div className="text-center bg-gray-50 p-4 rounded">
                    <p className="text-xs text-gray-600 mb-1">Fuente</p>
                    <p className="text-xs font-bold text-gray-900">∞ Box</p>
                  </div>
                </div>

                {/* Contenido */}
                <div className="bg-gray-50 p-4 rounded mb-6 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">📧 Asunto</p>
                    <p className="text-sm text-gray-900">{selected.subject || 'Sin asunto'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">📝 Mensaje</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {selected.body || 'Sin contenido'}
                    </p>
                  </div>
                </div>

                {/* Botón de aprobación */}
                {selected.status === 'draft' ? (
                  <button
                    onClick={() => approveCampaign(selected.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold mb-6 transition"
                  >
                    ✅ APROBAR CAMPAÑA
                  </button>
                ) : (
                  <div className="w-full bg-green-100 text-green-800 px-4 py-3 rounded-lg font-semibold mb-6 text-center">
                    ✅ YA APROBADA
                  </div>
                )}

                {/* Destinatarios */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">👥 Destinatarios ({recipients.length})</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {recipients.slice(0, 20).map(r => (
                      <div key={r.email} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-center">
                        <span className="font-mono text-xs">{r.email}</span>
                        <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded">{r.status}</span>
                      </div>
                    ))}
                    {recipients.length > 20 && (
                      <p className="text-xs text-gray-500 p-2">... y {recipients.length - 20} más</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
