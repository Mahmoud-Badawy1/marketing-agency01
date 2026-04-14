import { useState, useMemo } from 'react';

/**
 * Removes Arabic diacritics and normalizes some characters for better searching
 */
const normalizeText = (text: string): string => {
  return text
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
    .replace(/[يىإأآا]/g, (char) => {
      if (['إ', 'أ', 'آ'].includes(char)) return 'ا';
      if (char === 'ى') return 'ي';
      return char;
    })
    .toLowerCase();
};

/**
 * Hook for smart searching across an array of objects
 */
export function useSmartSearch<T>(data: T[], searchFields: (keyof T)[], query: string): T[] {
  return useMemo(() => {
    if (!query || query.trim() === '') return data;

    const normalizedQuery = normalizeText(query.trim());
    const searchTerms = normalizedQuery.split(/\s+/); // allow partial words

    return data.filter((item) => {
      // Create a combined string of all searchable fields to check against
      const combinedText = searchFields
        .map((field) => {
          const value = item[field];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value); // helps with {ar, en} fields
          return String(value);
        })
        .join(' ');

      const normalizedItemText = normalizeText(combinedText);

      // Check if all search terms exist in the combined text
      return searchTerms.every(term => normalizedItemText.includes(term));
    });
  }, [data, searchFields, query]);
}
