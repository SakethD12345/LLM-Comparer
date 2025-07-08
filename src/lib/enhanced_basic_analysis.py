import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.stem import WordNetLemmatizer
from nltk.tag import pos_tag
import nltk
import re
from typing import Dict, List, Tuple, Any, Optional
import json
import sys
from difflib import SequenceMatcher
from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
import io
import base64

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('vader_lexicon', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('wordnet', quiet=True)

class EnhancedBasicAnalyzer:
    """
    Enhanced basic text analysis with comprehensive metrics including:
    - Advanced readability metrics
    - Word frequency analysis
    - Part-of-speech analysis
    - Text statistics
    - Word cloud generation
    - Language complexity analysis
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=1000
        )
        self.stop_words = set(stopwords.words('english'))
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.lemmatizer = WordNetLemmatizer()
        
        # Common words for complexity analysis
        self.common_words = set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
        ])
    
    def preprocess_text(self, text: str) -> str:
        """Enhanced text preprocessing with lemmatization."""
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        text = ' '.join(text.split())
        return text
    
    def calculate_comprehensive_readability(self, text: str) -> Dict[str, Any]:
        """Calculate comprehensive readability metrics."""
        sentences = sent_tokenize(text)
        words = word_tokenize(text.lower())
        
        # Basic metrics
        sentence_count = len(sentences)
        word_count = len(words)
        unique_words = len(set(words))
        
        # Advanced metrics
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
        avg_word_length = np.mean([len(word) for word in words]) if words else 0
        lexical_diversity = unique_words / word_count if word_count > 0 else 0
        
        # Syllable counting for Flesch score
        syllable_count = sum(self._count_syllables(word) for word in words)
        
        # Flesch Reading Ease Score
        flesch_score = self._calculate_flesch_score(word_count, sentence_count, syllable_count)
        
        # Word complexity analysis
        complex_words = [word for word in words if len(word) > 6]
        complex_word_ratio = len(complex_words) / word_count if word_count > 0 else 0
        
        # Common word ratio
        common_word_count = sum(1 for word in words if word in self.common_words)
        common_word_ratio = common_word_count / word_count if word_count > 0 else 0
        
        return {
            'basic_metrics': {
                'sentence_count': sentence_count,
                'word_count': word_count,
                'unique_word_count': unique_words,
                'avg_sentence_length': round(avg_sentence_length, 2),
                'avg_word_length': round(avg_word_length, 2),
                'lexical_diversity': round(lexical_diversity, 3)
            },
            'complexity_metrics': {
                'flesch_reading_ease': round(flesch_score, 2),
                'complex_word_count': len(complex_words),
                'complex_word_ratio': round(complex_word_ratio, 3),
                'common_word_ratio': round(common_word_ratio, 3),
                'syllable_count': syllable_count
            },
            'readability_level': self._get_readability_level(flesch_score)
        }
    
    def _count_syllables(self, word: str) -> int:
        """Count syllables in a word."""
        word = word.lower()
        count = 0
        vowels = "aeiouy"
        on_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not on_vowel:
                count += 1
            on_vowel = is_vowel
        
        if word.endswith('e'):
            count -= 1
        return max(count, 1)
    
    def _calculate_flesch_score(self, word_count: int, sentence_count: int, syllable_count: int) -> float:
        """Calculate Flesch Reading Ease Score."""
        if sentence_count == 0 or word_count == 0:
            return 0.0
        return 206.835 - (1.015 * (word_count / sentence_count)) - (84.6 * (syllable_count / word_count))
    
    def _get_readability_level(self, flesch_score: float) -> str:
        """Get readability level based on Flesch score."""
        if flesch_score >= 90:
            return "Very Easy"
        elif flesch_score >= 80:
            return "Easy"
        elif flesch_score >= 70:
            return "Fairly Easy"
        elif flesch_score >= 60:
            return "Standard"
        elif flesch_score >= 50:
            return "Fairly Difficult"
        elif flesch_score >= 30:
            return "Difficult"
        else:
            return "Very Difficult"
    
    def analyze_word_frequency(self, text: str, top_n: int = 20) -> Dict[str, Any]:
        """Analyze word frequency and patterns."""
        words = word_tokenize(self.preprocess_text(text))
        
        # Remove stop words and short words
        filtered_words = [word for word in words if word not in self.stop_words and len(word) > 2]
        
        # Count frequencies
        word_freq = Counter(filtered_words)
        most_common = word_freq.most_common(top_n)
        
        # Calculate statistics
        total_words = len(filtered_words)
        unique_words = len(word_freq)
        avg_frequency = total_words / unique_words if unique_words > 0 else 0
        
        # Word length distribution
        word_lengths = [len(word) for word in filtered_words]
        length_distribution = Counter(word_lengths)
        
        return {
            'most_common_words': most_common,
            'statistics': {
                'total_words': total_words,
                'unique_words': unique_words,
                'avg_frequency': round(avg_frequency, 2),
                'vocabulary_richness': round(unique_words / total_words, 3) if total_words > 0 else 0
            },
            'length_distribution': dict(length_distribution),
            'word_frequency_dict': dict(word_freq)
        }
    
    def analyze_part_of_speech(self, text: str) -> Dict[str, Any]:
        """Analyze part-of-speech distribution."""
        words = word_tokenize(text)
        pos_tags = pos_tag(words)
        
        # Count POS tags
        pos_counts = Counter(tag for word, tag in pos_tags)
        
        # Categorize by major POS types
        pos_categories = {
            'nouns': sum(1 for tag in pos_counts.keys() if tag.startswith('NN')),
            'verbs': sum(1 for tag in pos_counts.keys() if tag.startswith('VB')),
            'adjectives': sum(1 for tag in pos_counts.keys() if tag.startswith('JJ')),
            'adverbs': sum(1 for tag in pos_counts.keys() if tag.startswith('RB')),
            'pronouns': sum(1 for tag in pos_counts.keys() if tag.startswith('PRP')),
            'prepositions': sum(1 for tag in pos_counts.keys() if tag.startswith('IN')),
            'conjunctions': sum(1 for tag in pos_counts.keys() if tag.startswith('CC')),
            'determiners': sum(1 for tag in pos_counts.keys() if tag.startswith('DT'))
        }
        
        return {
            'pos_distribution': dict(pos_counts),
            'pos_categories': pos_categories,
            'total_words': len(words)
        }
    
    def generate_word_cloud(self, text: str, max_words: int = 100) -> str:
        """Generate word cloud and return as base64 encoded image."""
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            # Create word cloud
            wordcloud = WordCloud(
                width=400, 
                height=300, 
                background_color='white',
                max_words=max_words,
                colormap='viridis'
            ).generate(processed_text)
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.figure(figsize=(8, 6))
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=150)
            plt.close()
            
            img_buffer.seek(0)
            img_str = base64.b64encode(img_buffer.getvalue()).decode()
            return img_str
            
        except Exception as e:
            return ""
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> Dict[str, float]:
        """Calculate multiple types of semantic similarity."""
        # TF-IDF similarity
        try:
            texts = [self.preprocess_text(text1), self.preprocess_text(text2)]
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            tfidf_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except:
            tfidf_similarity = 0.0
        
        # Sequence similarity
        sequence_similarity = SequenceMatcher(None, text1, text2).ratio()
        
        # Word overlap similarity
        words1 = set(self.preprocess_text(text1).split())
        words2 = set(self.preprocess_text(text2).split())
        
        if len(words1) == 0 or len(words2) == 0:
            word_overlap = 0.0
        else:
            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))
            word_overlap = intersection / union if union > 0 else 0.0
        
        return {
            'tfidf_similarity': round(tfidf_similarity, 3),
            'sequence_similarity': round(sequence_similarity, 3),
            'word_overlap_similarity': round(word_overlap, 3),
            'average_similarity': round((tfidf_similarity + sequence_similarity + word_overlap) / 3, 3)
        }
    
    def analyze_sentiment_enhanced(self, text: str) -> Dict[str, Any]:
        """Enhanced sentiment analysis with additional metrics."""
        # Basic VADER sentiment
        sentiment_scores = self.sentiment_analyzer.polarity_scores(text)
        
        # Sentiment classification
        compound = sentiment_scores['compound']
        if compound >= 0.05:
            sentiment_label = "Positive"
        elif compound <= -0.05:
            sentiment_label = "Negative"
        else:
            sentiment_label = "Neutral"
        
        # Sentiment intensity analysis
        sentences = sent_tokenize(text)
        sentence_sentiments = []
        
        for sentence in sentences:
            sent_score = self.sentiment_analyzer.polarity_scores(sentence)
            sentence_sentiments.append({
                'sentence': sentence,
                'compound': sent_score['compound'],
                'positive': sent_score['pos'],
                'negative': sent_score['neg'],
                'neutral': sent_score['neu']
            })
        
        # Calculate sentiment variance
        compound_scores = [s['compound'] for s in sentence_sentiments]
        sentiment_variance = np.var(compound_scores) if len(compound_scores) > 1 else 0
        
        return {
            'overall_sentiment': {
                'compound': round(sentiment_scores['compound'], 3),
                'positive': round(sentiment_scores['pos'], 3),
                'negative': round(sentiment_scores['neg'], 3),
                'neutral': round(sentiment_scores['neu'], 3),
                'label': sentiment_label
            },
            'sentence_sentiments': sentence_sentiments,
            'sentiment_variance': round(sentiment_variance, 3),
            'sentiment_consistency': 'High' if sentiment_variance < 0.1 else 'Medium' if sentiment_variance < 0.3 else 'Low'
        }
    
    def comprehensive_analysis(self, text1: str, text2: str) -> Dict[str, Any]:
        """Perform comprehensive analysis of two texts."""
        # Basic analysis
        readability1 = self.calculate_comprehensive_readability(text1)
        readability2 = self.calculate_comprehensive_readability(text2)
        
        # Word frequency analysis
        word_freq1 = self.analyze_word_frequency(text1)
        word_freq2 = self.analyze_word_frequency(text2)
        
        # POS analysis
        pos1 = self.analyze_part_of_speech(text1)
        pos2 = self.analyze_part_of_speech(text2)
        
        # Sentiment analysis
        sentiment1 = self.analyze_sentiment_enhanced(text1)
        sentiment2 = self.analyze_sentiment_enhanced(text2)
        
        # Similarity analysis
        similarity = self.calculate_semantic_similarity(text1, text2)
        
        # Generate word clouds
        wordcloud1 = self.generate_word_cloud(text1)
        wordcloud2 = self.generate_word_cloud(text2)
        
        # Calculate differences
        readability_diff = {
            'sentence_count_diff': abs(readability1['basic_metrics']['sentence_count'] - readability2['basic_metrics']['sentence_count']),
            'word_count_diff': abs(readability1['basic_metrics']['word_count'] - readability2['basic_metrics']['word_count']),
            'lexical_diversity_diff': abs(readability1['basic_metrics']['lexical_diversity'] - readability2['basic_metrics']['lexical_diversity']),
            'flesch_score_diff': abs(readability1['complexity_metrics']['flesch_reading_ease'] - readability2['complexity_metrics']['flesch_reading_ease'])
        }
        
        return {
            'text1_analysis': {
                'readability': readability1,
                'word_frequency': word_freq1,
                'part_of_speech': pos1,
                'sentiment': sentiment1,
                'wordcloud': wordcloud1
            },
            'text2_analysis': {
                'readability': readability2,
                'word_frequency': word_freq2,
                'part_of_speech': pos2,
                'sentiment': sentiment2,
                'wordcloud': wordcloud2
            },
            'similarity_analysis': similarity,
            'differences': readability_diff,
            'summary': {
                'text1_complexity': readability1['complexity_metrics']['flesch_reading_ease'],
                'text2_complexity': readability2['complexity_metrics']['flesch_reading_ease'],
                'complexity_difference': readability_diff['flesch_score_diff'],
                'sentiment_difference': abs(sentiment1['overall_sentiment']['compound'] - sentiment2['overall_sentiment']['compound'])
            }
        }

def analyze_comparison_results(results_file: str) -> Dict:
    """Analyze a file containing comparison results."""
    analyzer = EnhancedBasicAnalyzer()
    
    try:
        with open(results_file, 'r') as f:
            results = json.load(f)
        
        if not results or len(results) == 0:
            return {'error': 'No results to analyze'}
        
        result = results[0]  # Analyze the first comparison
        analysis = analyzer.comprehensive_analysis(
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