import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Verse } from '../types';
import { getRandomVerse } from '../lib/api/bible';
import { BookOpen, Loader2 } from 'lucide-react';

export function Evangelio() {
  const [cachedVerse, setCachedVerse] = useState<Verse | null>({
    verse: "Juan 3:16",
    book: "Juan",
    chapter: 3,
    verseNumber: 16,
    text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
    translation: "Reina Valera"
  });

  const { data: verse, isLoading } = useQuery({
    queryKey: ['verse'],
    queryFn: getRandomVerse,
    staleTime: 24 * 60 * 60 * 1000, // Cache 24 horas
    retry: 1
  });

  useEffect(() => {
    if (verse) {
      setCachedVerse(verse);
    }
  }, [verse]);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 shadow-md h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-amber-700" />
        <h2 className="text-lg font-bold text-amber-900">Evangelio del Día</h2>
      </div>

      {cachedVerse ? (
        <div className="space-y-4 flex-1">
          <p className="text-sm font-semibold text-amber-700">{cachedVerse.verse}</p>
          <p className="text-gray-700 leading-relaxed italic">
            "{cachedVerse.text}"
          </p>
          <p className="text-xs text-gray-500">
            {cachedVerse.translation}
          </p>
          {isLoading && <p className="text-xs text-amber-600 mt-2">Actualizando...</p>}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No se pudo cargar el verso</p>
      )}
    </div>
  );
}
