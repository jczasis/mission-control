import { supabase } from './supabase';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipient_count: number;
  status: 'pending' | 'approved' | 'sent';
  created_at: string;
  approved_at?: string;
  scheduled_for?: string;
  sent_at?: string;
}

export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

export async function approveEmailCampaign(campaignId: string): Promise<void> {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'approved',
        approved_at: now
      })
      .eq('id', campaignId);

    if (error) throw error;

    // TODO: Enviar notificación a Telegram
    console.log(`Campaign ${campaignId} approved at ${now}`);
  } catch (error) {
    console.error('Error approving campaign:', error);
    throw error;
  }
}

export async function scheduleEmailCampaign(campaignId: string): Promise<void> {
  try {
    // Programar para mañana a las 09:30 CL
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 30, 0, 0);

    const { error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'scheduled',
        scheduled_for: tomorrow.toISOString()
      })
      .eq('id', campaignId);

    if (error) throw error;

    console.log(`Campaign ${campaignId} scheduled for ${tomorrow.toISOString()}`);
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    throw error;
  }
}

export async function getCampaignStats(): Promise<{
  pending: number;
  approved: number;
  sent: number;
  total_recipients: number;
  bounce_rate: number;
}> {
  try {
    const { data: campaigns, error } = await supabase
      .from('email_campaigns')
      .select('status, recipient_count');

    if (error) throw error;

    const stats = {
      pending: campaigns?.filter(c => c.status === 'pending').length || 0,
      approved: campaigns?.filter(c => c.status === 'approved').length || 0,
      sent: campaigns?.filter(c => c.status === 'sent').length || 0,
      total_recipients: campaigns?.reduce((sum, c) => sum + c.recipient_count, 0) || 0,
      bounce_rate: 0 // TODO: Calcular desde email_bounces
    };

    return stats;
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return {
      pending: 0,
      approved: 0,
      sent: 0,
      total_recipients: 0,
      bounce_rate: 0
    };
  }
}
