export interface Verse {
  verse: string;
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  translation: string;
}

export interface PolymarketMarket {
  slug: string;
  title: string;
  resolutionSource: string;
  outcomes: string[];
  outcomePrices: number[];
  volume24h: number;
  createdAt: string;
  closed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  due?: string;
  notes?: string;
}

export interface Metric {
  label: string;
  value: number;
  unit: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface CronJob {
  id: string;
  name: string;
  lastRun: string;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  nextRun?: string;
}

export interface InfinityBoxMetrics {
  emailsSentToday: number;
  openRate: number;
  conversions: number;
}

export interface EmpexMetrics {
  galponesFoundToday: number;
  cotizacionesSent: number;
  leadsActivos: number;
}

export interface SEIAMetrics {
  newProjectsToday: number;
}
