import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  html_body?: string;
  status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'sent' | 'failed';
  created_by: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  scheduled_for?: string;
  sent_at?: string;
  recipient_count: number;
  delivered_count: number;
  bounce_count: number;
  failed_count: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface EmailRecipient {
  id: string;
  campaign_id: string;
  email: string;
  name?: string;
  company?: string;
  lead_source?: string;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'unsubscribed';
  sent_at?: string;
  delivered_at?: string;
  bounce_reason?: string;
  opened: boolean;
  clicked: boolean;
}

export interface MailerStats {
  total_sent: number;
  total_delivered: number;
  total_bounced: number;
  pending_approval: number;
  scheduled_campaigns: number;
}

// ============================================================================
// CAMPAIGNS
// ============================================================================

export async function getCampaigns(): Promise<EmailCampaign[]> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCampaignById(id: string): Promise<EmailCampaign> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCampaign(campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<EmailCampaign> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function approveCampaign(id: string, approvedBy: string): Promise<EmailCampaign> {
  return updateCampaign(id, {
    status: 'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString()
  });
}

export async function rejectCampaign(id: string): Promise<EmailCampaign> {
  return updateCampaign(id, {
    status: 'draft'
  });
}

export async function scheduleCampaign(id: string, scheduledFor: string): Promise<EmailCampaign> {
  return updateCampaign(id, {
    status: 'scheduled',
    scheduled_for: scheduledFor
  });
}

export async function markAsSent(id: string): Promise<EmailCampaign> {
  return updateCampaign(id, {
    status: 'sent',
    sent_at: new Date().toISOString()
  });
}

// ============================================================================
// RECIPIENTS
// ============================================================================

export async function getRecipients(campaignId: string): Promise<EmailRecipient[]> {
  const { data, error } = await supabase
    .from('email_recipients')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addRecipients(campaignId: string, recipients: Array<{
  email: string;
  name?: string;
  company?: string;
  lead_source?: string;
}>): Promise<EmailRecipient[]> {
  const recipientsData = recipients.map(r => ({
    ...r,
    campaign_id: campaignId,
    status: 'pending'
  }));

  const { data, error } = await supabase
    .from('email_recipients')
    .insert(recipientsData)
    .select();

  if (error) throw error;

  // Update campaign recipient count
  if (data) {
    const campaign = await getCampaignById(campaignId);
    const newCount = campaign.recipient_count + data.length;
    await updateCampaign(campaignId, { recipient_count: newCount });
  }

  return data || [];
}

export async function markRecipientAsDelivered(recipientId: string): Promise<EmailRecipient> {
  const { data, error } = await supabase
    .from('email_recipients')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString()
    })
    .eq('id', recipientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markRecipientAsBounced(recipientId: string, reason: string): Promise<EmailRecipient> {
  const { data, error } = await supabase
    .from('email_recipients')
    .update({
      status: 'bounced',
      bounce_reason: reason
    })
    .eq('id', recipientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// STATS & VIEWS
// ============================================================================

export async function getMailerStats(): Promise<MailerStats> {
  const { data, error } = await supabase
    .from('vw_mailer_stats')
    .select('*')
    .single();

  if (error) {
    console.warn('vw_mailer_stats no existe aún:', error.message);
    // Fallback: calcular manualmente
    return {
      total_sent: 0,
      total_delivered: 0,
      total_bounced: 0,
      pending_approval: 0,
      scheduled_campaigns: 0
    };
  }

  return data;
}

export async function getScheduledTomorrow(): Promise<EmailCampaign[]> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('status', 'scheduled')
    .gte('scheduled_for', tomorrow.toISOString())
    .lt('scheduled_for', dayAfter.toISOString())
    .order('scheduled_for', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============================================================================
// HISTORY & AUDIT
// ============================================================================

export async function logAction(
  campaignId: string,
  action: string,
  actor: string,
  details?: string,
  recipientId?: string
): Promise<void> {
  const { error } = await supabase
    .from('email_history')
    .insert([{
      campaign_id: campaignId,
      recipient_id: recipientId,
      action,
      actor,
      details,
      created_at: new Date().toISOString()
    }]);

  if (error) console.error('Error logging action:', error);
}

export async function getCampaignHistory(campaignId: string) {
  const { data, error } = await supabase
    .from('email_history')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============================================================================
// TEMPLATES
// ============================================================================

export async function getTemplates() {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTemplateByName(name: string) {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('name', name)
    .single();

  if (error) throw error;
  return data;
}

export async function createTemplate(template: {
  name: string;
  subject: string;
  body: string;
  html_body?: string;
  variables?: any;
  category?: string;
}) {
  const { data, error } = await supabase
    .from('email_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data;
}
