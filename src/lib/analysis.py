import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import re
from typing import Dict, List, Tuple
import json

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')

class ResponseAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.stop_words = set(stopwords.words('english'))

    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for analysis."""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts."""
        texts = [self.preprocess_text(text1), self.preprocess_text(text2)]
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    def calculate_metrics(self, text: str) -> Dict[str, float]:
        """Calculate various text metrics."""
        # Tokenize
        tokens = word_tokenize(self.preprocess_text(text))
        
        # Remove stopwords
        tokens = [token for token in tokens if token not in self.stop_words]
        
        # Calculate metrics
        metrics = {
            'word_count': len(tokens),
            'unique_words': len(set(tokens)),
            'lexical_diversity': len(set(tokens)) / len(tokens) if tokens else 0,
            'avg_word_length': np.mean([len(token) for token in tokens]) if tokens else 0
        }
        
        return metrics

    def analyze_responses(self, response1: str, response2: str) -> Dict:
        """Analyze and compare two model responses."""
        # Calculate similarity
        similarity = self.calculate_similarity(response1, response2)
        
        # Calculate individual metrics
        metrics1 = self.calculate_metrics(response1)
        metrics2 = self.calculate_metrics(response2)
        
        # Calculate differences
        differences = {
            'word_count_diff': abs(metrics1['word_count'] - metrics2['word_count']),
            'unique_words_diff': abs(metrics1['unique_words'] - metrics2['unique_words']),
            'lexical_diversity_diff': abs(metrics1['lexical_diversity'] - metrics2['lexical_diversity']),
            'avg_word_length_diff': abs(metrics1['avg_word_length'] - metrics2['avg_word_length'])
        }
        
        return {
            'similarity_score': float(similarity),
            'response1_metrics': metrics1,
            'response2_metrics': metrics2,
            'differences': differences
        }

def analyze_comparison_results(results_file: str) -> Dict:
    """Analyze a file containing comparison results."""
    analyzer = ResponseAnalyzer()
    
    try:
        with open(results_file, 'r') as f:
            results = json.load(f)
        
        analysis_results = []
        for result in results:
            analysis = analyzer.analyze_responses(
                result['model1']['text'],
                result['model2']['text']
            )
            analysis_results.append({
                'timestamp': result['timestamp'],
                'model1': result['model1']['model'],
                'model2': result['model2']['model'],
                'analysis': analysis
            })
        
        return {
            'comparisons': analysis_results,
            'summary': {
                'total_comparisons': len(analysis_results),
                'avg_similarity': np.mean([r['analysis']['similarity_score'] for r in analysis_results]),
                'most_similar_pair': max(analysis_results, key=lambda x: x['analysis']['similarity_score']),
                'least_similar_pair': min(analysis_results, key=lambda x: x['analysis']['similarity_score'])
            }
        }
    
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    # Example usage
    results = analyze_comparison_results('comparison_results.json')
    print(json.dumps(results, indent=2)) 