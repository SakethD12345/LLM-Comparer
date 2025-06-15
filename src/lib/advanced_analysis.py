import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import re
from typing import Dict, List, Tuple, Any
import json
from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
import networkx as nx

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')

class AdvancedResponseAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=1000
        )
        self.stop_words = set(stopwords.words('english'))
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

    def preprocess_text(self, text: str) -> str:
        """Advanced text preprocessing."""
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        text = ' '.join(text.split())
        return text

    def extract_ngrams(self, text: str, n: int) -> List[str]:
        """Extract n-grams from text."""
        tokens = word_tokenize(self.preprocess_text(text))
        return [' '.join(tokens[i:i+n]) for i in range(len(tokens)-n+1)]

    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity using TF-IDF and cosine similarity."""
        texts = [self.preprocess_text(text1), self.preprocess_text(text2)]
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Perform sentiment analysis using VADER."""
        return self.sentiment_analyzer.polarity_scores(text)

    def calculate_readability_metrics(self, text: str) -> Dict[str, float]:
        """Calculate various readability metrics."""
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        # Calculate average sentence length
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        # Calculate average word length
        avg_word_length = np.mean([len(word) for word in words]) if words else 0
        
        # Calculate lexical diversity
        unique_words = set(words)
        lexical_diversity = len(unique_words) / len(words) if words else 0
        
        return {
            'avg_sentence_length': avg_sentence_length,
            'avg_word_length': avg_word_length,
            'lexical_diversity': lexical_diversity,
            'sentence_count': len(sentences),
            'word_count': len(words),
            'unique_word_count': len(unique_words)
        }

    def extract_key_phrases(self, text: str, top_n: int = 5) -> List[Tuple[str, float]]:
        """Extract key phrases using TF-IDF."""
        vectorizer = TfidfVectorizer(ngram_range=(2, 3), stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()
        
        # Get top phrases
        scores = tfidf_matrix.toarray()[0]
        top_indices = scores.argsort()[-top_n:][::-1]
        
        return [(feature_names[i], scores[i]) for i in top_indices]

    def analyze_responses(self, response1: str, response2: str) -> Dict[str, Any]:
        """Perform comprehensive analysis of two responses."""
        # Basic metrics
        metrics1 = self.calculate_readability_metrics(response1)
        metrics2 = self.calculate_readability_metrics(response2)
        
        # Sentiment analysis
        sentiment1 = self.analyze_sentiment(response1)
        sentiment2 = self.analyze_sentiment(response2)
        
        # Key phrases
        key_phrases1 = self.extract_key_phrases(response1)
        key_phrases2 = self.extract_key_phrases(response2)
        
        # Semantic similarity
        similarity = self.calculate_semantic_similarity(response1, response2)
        
        # Calculate differences
        differences = {
            'readability_diff': {
                k: abs(metrics1[k] - metrics2[k])
                for k in metrics1.keys()
            },
            'sentiment_diff': {
                k: abs(sentiment1[k] - sentiment2[k])
                for k in sentiment1.keys()
            }
        }
        
        return {
            'similarity_score': float(similarity),
            'response1_metrics': {
                'readability': metrics1,
                'sentiment': sentiment1,
                'key_phrases': key_phrases1
            },
            'response2_metrics': {
                'readability': metrics2,
                'sentiment': sentiment2,
                'key_phrases': key_phrases2
            },
            'differences': differences
        }

    def generate_visualizations(self, response1: str, response2: str, output_dir: str):
        """Generate visualizations for response analysis."""
        # Word clouds
        self._generate_wordcloud(response1, f"{output_dir}/response1_wordcloud.png")
        self._generate_wordcloud(response2, f"{output_dir}/response2_wordcloud.png")
        
        # Sentiment comparison
        self._plot_sentiment_comparison(response1, response2, f"{output_dir}/sentiment_comparison.png")
        
        # Readability metrics
        self._plot_readability_metrics(response1, response2, f"{output_dir}/readability_metrics.png")

    def _generate_wordcloud(self, text: str, output_path: str):
        """Generate word cloud visualization."""
        wordcloud = WordCloud(
            width=800,
            height=400,
            background_color='white',
            max_words=100
        ).generate(text)
        
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.savefig(output_path)
        plt.close()

    def _plot_sentiment_comparison(self, text1: str, text2: str, output_path: str):
        """Plot sentiment comparison."""
        sentiment1 = self.analyze_sentiment(text1)
        sentiment2 = self.analyze_sentiment(text2)
        
        plt.figure(figsize=(10, 6))
        x = np.arange(len(sentiment1))
        width = 0.35
        
        plt.bar(x - width/2, sentiment1.values(), width, label='Response 1')
        plt.bar(x + width/2, sentiment2.values(), width, label='Response 2')
        
        plt.xlabel('Sentiment Metrics')
        plt.ylabel('Score')
        plt.title('Sentiment Analysis Comparison')
        plt.xticks(x, sentiment1.keys())
        plt.legend()
        
        plt.savefig(output_path)
        plt.close()

    def _plot_readability_metrics(self, text1: str, text2: str, output_path: str):
        """Plot readability metrics comparison."""
        metrics1 = self.calculate_readability_metrics(text1)
        metrics2 = self.calculate_readability_metrics(text2)
        
        plt.figure(figsize=(12, 6))
        x = np.arange(len(metrics1))
        width = 0.35
        
        plt.bar(x - width/2, metrics1.values(), width, label='Response 1')
        plt.bar(x + width/2, metrics2.values(), width, label='Response 2')
        
        plt.xlabel('Readability Metrics')
        plt.ylabel('Value')
        plt.title('Readability Metrics Comparison')
        plt.xticks(x, metrics1.keys(), rotation=45)
        plt.legend()
        
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()

def analyze_comparison_results(results_file: str, output_dir: str = 'analysis_results') -> Dict:
    """Analyze a file containing comparison results and generate visualizations."""
    analyzer = AdvancedResponseAnalyzer()
    
    try:
        with open(results_file, 'r') as f:
            results = json.load(f)
        
        analysis_results = []
        for i, result in enumerate(results):
            analysis = analyzer.analyze_responses(
                result['model1']['text'],
                result['model2']['text']
            )
            
            # Generate visualizations
            analyzer.generate_visualizations(
                result['model1']['text'],
                result['model2']['text'],
                f"{output_dir}/comparison_{i}"
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