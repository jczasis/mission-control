import { createClient } from '@supabase/supabase-js';
import { CronJob, InfinityBoxMetrics, EmpexMetrics, SEIAMetrics } from '../../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getCronJobs(): Promise<CronJob[]> {
  try {
    const { data, error } = await supabase
      .from('script_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.script_name,
      lastRun: row.created_at,
      status: row.status,
      errorMessage: row.error_message,
      nextRun: row.next_run
    }));
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    return [];
  }
}

export async function getInfinityBoxMetrics(): Promise<InfinityBoxMetrics> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('email_campaigns')
      .select('id, status, opened, clicked')
      .gte('sent_at', `${today}T00:00:00`)
      .lte('sent_at', `${today}T23:59:59`);

    if (error) throw error;

    const emails = data || [];
    const opened = emails.filter(e => e.opened).length;
    const conversions = emails.filter(e => e.clicked).length;

    return {
      emailsSentToday: emails.length,
      openRate: emails.length > 0 ? (opened / emails.length) * 100 : 0,
      conversions
    };
  } catch (error) {
    console.error('Error fetching Infinity Box metrics:', error);
    return { emailsSentToday: 0, openRate: 0, conversions: 0 };
  }
}

export async function getEmpexMetrics(): Promise<EmpexMetrics> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: galpones } = await supabase
      .from('empex_galpones')
      .select('id')
      .gte('found_at', `${today}T00:00:00`)
      .lte('found_at', `${today}T23:59:59`);

    const { data: quotes } = await supabase
      .from('empex_quotes')
      .select('id')
      .gte('sent_at', `${today}T00:00:00`)
      .lte('sent_at', `${today}T23:59:59`);

    const { data: leads } = await supabase
      .from('empex_leads')
      .select('id')
      .eq('status', 'active');

    return {
      galponesFoundToday: galpones?.length || 0,
      cotizacionesSent: quotes?.length || 0,
      leadsActivos: leads?.length || 0
    };
  } catch (error) {
    console.error('Error fetching EMPEX metrics:', error);
    return { galponesFoundToday: 0, cotizacionesSent: 0, leadsActivos: 0 };
  }
}

export async function getSEIAMetrics(): Promise<SEIAMetrics> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('seia_projects')
      .select('id')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    return { newProjectsToday: data?.length || 0 };
  } catch (error) {
    console.error('Error fetching SEIA metrics:', error);
    return { newProjectsToday: 0 };
  }
}

export async function createCronJobEntry(
  scriptName: string,
  status: 'success' | 'error',
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('script_runs').insert({
      script_name: scriptName,
      status,
      error_message: errorMessage,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating cron job entry:', error);
  }
}
