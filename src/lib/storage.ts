import { ComparisonResult } from '@/types/api';

const STORAGE_KEY = 'llm-comparer-history';

export function saveComparisonResults(results: ComparisonResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Error saving comparison results:', error);
  }
}

export function loadComparisonResults(): ComparisonResult[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading comparison results:', error);
    return [];
  }
} 