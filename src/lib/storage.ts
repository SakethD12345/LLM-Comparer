import { ComparisonResult } from '@/types/api';

const STORAGE_KEY = 'llm-comparer-history';

function isValidComparisonResult(result: any): result is ComparisonResult {
  return (
    result &&
    typeof result === 'object' &&
    typeof result.model1 === 'object' &&
    typeof result.model2 === 'object' &&
    typeof result.timestamp === 'string' &&
    typeof result.model1.text === 'string' &&
    typeof result.model1.model === 'string' &&
    typeof result.model2.text === 'string' &&
    typeof result.model2.model === 'string'
  );
}

export function saveComparisonResults(results: ComparisonResult[]): void {
  try {
    if (!Array.isArray(results)) {
      throw new Error('Results must be an array');
    }

    // Validate each result before saving
    results.forEach((result, index) => {
      if (!isValidComparisonResult(result)) {
        throw new Error(`Invalid comparison result at index ${index}`);
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Error saving comparison results:', error);
    // Clear potentially corrupted data
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function loadComparisonResults(): ComparisonResult[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error('Saved data is not an array');
    }

    // Filter out invalid results
    const validResults = parsed.filter(isValidComparisonResult);
    
    // If we filtered out any results, save the cleaned data
    if (validResults.length !== parsed.length) {
      saveComparisonResults(validResults);
    }

    return validResults;
  } catch (error) {
    console.error('Error loading comparison results:', error);
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
} 