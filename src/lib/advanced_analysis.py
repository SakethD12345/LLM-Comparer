import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import re
from typing import Dict, List, Tuple, Any
import json
import sys
from difflib import SequenceMatcher

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('vader_lexicon', quiet=True)

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

    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity using TF-IDF and cosine similarity."""
        try:
            texts = [self.preprocess_text(text1), self.preprocess_text(text2)]
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except:
            # Fallback to sequence similarity for very short texts
            return SequenceMatcher(None, text1, text2).ratio()

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
        try:
            vectorizer = TfidfVectorizer(ngram_range=(2, 3), stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([text])
            feature_names = vectorizer.get_feature_names_out()
            
            # Get top phrases
            scores = tfidf_matrix.toarray()[0]
            top_indices = scores.argsort()[-top_n:][::-1]
            
            return [(feature_names[i], scores[i]) for i in top_indices]
        except:
            # Fallback to simple word frequency for very short texts
            words = word_tokenize(self.preprocess_text(text))
            word_freq = {}
            for word in words:
                if word not in self.stop_words:
                    word_freq[word] = word_freq.get(word, 0) + 1
            return sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:top_n]

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

def analyze_comparison_results(results_file: str) -> Dict:
    """Analyze a file containing comparison results."""
    analyzer = AdvancedResponseAnalyzer()
    
    try:
        with open(results_file, 'r') as f:
            results = json.load(f)
        
        if not results or len(results) == 0:
            return {'error': 'No results to analyze'}
        
        result = results[0]  # Analyze the first comparison
        analysis = analyzer.analyze_responses(
            result['model1']['text'],
            result['model2']['text']
        )
        
        return analysis
    
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Please provide a results file path'}))
        sys.exit(1)
        
    results = analyze_comparison_results(sys.argv[1])
    print(json.dumps(results)) 