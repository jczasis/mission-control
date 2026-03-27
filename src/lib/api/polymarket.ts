import axios from 'axios';
import { PolymarketMarket } from '../../types';

const POLYMARKET_API = import.meta.env.VITE_POLYMARKET_API;

// Mercados hot de Venezuela/Latam
const HOT_MARKETS = [
  'will-venezuela-authorize-foreign-investment-before-eoy-2026',
  'will-petro-cryptocurrency-gain-mainstream-adoption-in-latam-by-2026',
  'will-hyperinflation-continue-in-venezuela-through-q2-2026',
  'will-maduro-remain-in-power-through-2026',
  'will-latam-crypto-adoption-exceed-15-percent-by-2026',
];

export async function getPolymarketMarkets(): Promise<PolymarketMarket[]> {
  try {
    const response = await axios.get(`${POLYMARKET_API}/markets`, {
      timeout: 10000,
      params: { limit: 100 }
    });

    const markets = response.data as PolymarketMarket[];

    // Filtrar solo mercados hot de Venezuela
    return markets.filter(m =>
      HOT_MARKETS.some(hot => m.slug.includes(hot))
    ).slice(0, 5);
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    // Retornar mock si falla
    return getMockPolymarkets();
  }
}

function getMockPolymarkets(): PolymarketMarket[] {
  return [
    {
      slug: 'venezuela-crypto-adoption',
      title: 'Will crypto adoption in Venezuela exceed 20% by EOY 2026?',
      resolutionSource: 'Reuters',
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.68, 0.32],
      volume24h: 125000,
      createdAt: '2026-01-15',
      closed: false
    },
    {
      slug: 'petro-mainstream-2026',
      title: 'Will Petro (PTRO) reach $1 market cap by Q3 2026?',
      resolutionSource: 'CoinGecko',
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.45, 0.55],
      volume24h: 89000,
      createdAt: '2026-02-01',
      closed: false
    }
  ];
}
