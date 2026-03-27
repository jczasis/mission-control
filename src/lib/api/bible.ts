import axios from 'axios';
import { Verse } from '../../types';

const BIBLE_API = import.meta.env.VITE_BIBLE_API;

export async function getRandomVerse(): Promise<Verse> {
  try {
    const response = await axios.get(
      `${BIBLE_API}/REINA_VALERA/`,
      { timeout: 5000 }
    );

    return {
      verse: `${response.data.book} ${response.data.chapter}:${response.data.verse}`,
      book: response.data.book,
      chapter: response.data.chapter,
      verseNumber: response.data.verse,
      text: response.data.text,
      translation: 'Reina Valera'
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    throw error;
  }
}
