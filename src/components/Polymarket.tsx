import { useQuery } from '@tanstack/react-query';
import { PolymarketMarket } from '../types';
import { getPolymarketMarkets } from '../lib/api/polymarket';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export function PolymarketCards() {
  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['polymarket'],
    queryFn: getPolymarketMarkets,
    refetchInterval: 5 * 60 * 1000, // Cada 5 min
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Polymarket - Venezuela Hot</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      ) : markets.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay mercados disponibles</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {markets.map((market) => (
            <PolymarketCard key={market.slug} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}

function PolymarketCard({ market }: { market: PolymarketMarket }) {
  const yesPrice = market.outcomePrices[0];
  const noPrice = market.outcomePrices[1];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
        {market.title}
      </h3>

      <div className="space-y-2">
        {/* YES precio */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Sí</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-600">{(yesPrice * 100).toFixed(0)}%</span>
            {yesPrice > 0.5 && <TrendingUp className="w-4 h-4 text-green-600" />}
          </div>
        </div>

        {/* NO precio */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">No</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600">{(noPrice * 100).toFixed(0)}%</span>
            {noPrice > 0.5 && <TrendingDown className="w-4 h-4 text-red-600" />}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>Vol. 24h: ${(market.volume24h / 1000).toFixed(0)}k</span>
        <span className="text-gray-400">
          {market.closed ? 'Cerrado' : 'Abierto'}
        </span>
      </div>
    </div>
  );
}
