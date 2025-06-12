import { saveComparisonResults, loadComparisonResults } from './storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Storage Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveComparisonResults saves data correctly', () => {
    const testData = [
      {
        model1: { text: 'Test response 1', model: 'gpt2' },
        model2: { text: 'Test response 2', model: 'opt-125m' },
        timestamp: new Date().toISOString(),
      },
    ];

    saveComparisonResults(testData);
    const saved = localStorage.getItem('llm-comparer-history');
    expect(saved).toBe(JSON.stringify(testData));
  });

  test('loadComparisonResults loads data correctly', () => {
    const testData = [
      {
        model1: { text: 'Test response 1', model: 'gpt2' },
        model2: { text: 'Test response 2', model: 'opt-125m' },
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem('llm-comparer-history', JSON.stringify(testData));
    const loaded = loadComparisonResults();
    expect(loaded).toEqual(testData);
  });

  test('loadComparisonResults returns empty array when no data exists', () => {
    const loaded = loadComparisonResults();
    expect(loaded).toEqual([]);
  });

  test('loadComparisonResults handles invalid JSON', () => {
    localStorage.setItem('llm-comparer-history', 'invalid-json');
    const loaded = loadComparisonResults();
    expect(loaded).toEqual([]);
  });
}); 