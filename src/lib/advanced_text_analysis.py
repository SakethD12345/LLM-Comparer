import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation, TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
from typing import Dict, List, Tuple, Any
import json
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

class AdvancedTextAnalyzer:
    """
    Advanced text analysis using multiple NLP techniques including:
    - BERT-based semantic similarity
    - Topic modeling with LDA
    - Named Entity Recognition
    - Advanced text preprocessing
    """
    
    def __init__(self):
        """Initialize the analyzer with required models and components."""
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Initialize spaCy for NER (using smaller model for efficiency)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
        
        # Initialize TF-IDF vectorizer for topic modeling
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Initialize LDA for topic modeling
        self.lda_model = LatentDirichletAllocation(
            n_components=5,
            random_state=42,
            max_iter=10
        )
    
    def preprocess_text(self, text: str) -> str:
        """
        Advanced text preprocessing including:
        - Lowercase conversion
        - Special character removal
        - Lemmatization
        - Stop word removal
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep apostrophes
        text = re.sub(r'[^a-zA-Z\s\']', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Lemmatize and remove stop words
        tokens = [
            self.lemmatizer.lemmatize(token) 
            for token in tokens 
            if token not in self.stop_words and len(token) > 2
        ]
        
        return ' '.join(tokens)
    
    def extract_named_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract named entities using spaCy NER.
        Returns entities categorized by type.
        """
        doc = self.nlp(text)
        entities = {}
        
        for ent in doc.ents:
            if ent.label_ not in entities:
                entities[ent.label_] = []
            entities[ent.label_].append(ent.text)
        
        # Remove duplicates while preserving order
        for label in entities:
            entities[label] = list(dict.fromkeys(entities[label]))
        
        return entities
    
    def perform_topic_modeling(self, texts: List[str], n_topics: int = 5) -> Dict[str, Any]:
        """
        Perform topic modeling using LDA on a collection of texts.
        Returns topics with their top words and topic distribution.
        """
        # Preprocess texts
        processed_texts = [self.preprocess_text(text) for text in texts]
        
        # Create TF-IDF matrix
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(processed_texts)
        
        # Adjust number of topics if there are fewer features
        n_topics = min(n_topics, tfidf_matrix.shape[1])
        if n_topics < 2:
            n_topics = 2
        
        # Fit LDA model
        lda_model = LatentDirichletAllocation(
            n_components=n_topics,
            random_state=42,
            max_iter=10
        )
        lda_output = lda_model.fit_transform(tfidf_matrix)
        
        # Get feature names (words)
        feature_names = self.tfidf_vectorizer.get_feature_names_out()
        
        # Extract top words for each topic
        topics = []
        for topic_idx, topic in enumerate(lda_model.components_):
            top_words_idx = topic.argsort()[-10:][::-1]
            top_words = [feature_names[i] for i in top_words_idx]
            topics.append({
                'topic_id': topic_idx,
                'top_words': top_words,
                'word_weights': topic[top_words_idx].tolist()
            })
        
        # Calculate topic distribution for each text
        topic_distributions = []
        for i, text in enumerate(texts):
            topic_dist = lda_output[i]
            dominant_topic = topic_dist.argmax()
            topic_distributions.append({
                'text_index': i,
                'dominant_topic': int(dominant_topic),
                'topic_distribution': topic_dist.tolist(),
                'confidence': float(topic_dist.max())
            })
        
        return {
            'topics': topics,
            'topic_distributions': topic_distributions,
            'n_topics': n_topics
        }
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> Dict[str, float]:
        """
        Calculate multiple types of semantic similarity:
        - TF-IDF cosine similarity
        - LSI-based similarity
        - Word overlap similarity
        """
        # Preprocess texts
        processed_text1 = self.preprocess_text(text1)
        processed_text2 = self.preprocess_text(text2)
        
        # TF-IDF similarity
        tfidf_matrix = self.tfidf_vectorizer.fit_transform([processed_text1, processed_text2])
        tfidf_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        # LSI similarity - adaptive number of components
        n_features = tfidf_matrix.shape[1]
        n_components = min(50, max(2, n_features // 2))  # Adaptive components
        
        try:
            lsi_model = TruncatedSVD(
                n_components=n_components,
                random_state=42
            )
            lsi_matrix = lsi_model.fit_transform(tfidf_matrix)
            lsi_similarity = cosine_similarity(lsi_matrix[0:1], lsi_matrix[1:2])[0][0]
        except:
            # Fallback to TF-IDF similarity if LSI fails
            lsi_similarity = tfidf_similarity
        
        # Word overlap similarity
        words1 = set(processed_text1.split())
        words2 = set(processed_text2.split())
        
        if len(words1) == 0 or len(words2) == 0:
            word_overlap = 0.0
        else:
            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))
            word_overlap = intersection / union if union > 0 else 0.0
        
        return {
            'tfidf_similarity': float(tfidf_similarity),
            'lsi_similarity': float(lsi_similarity),
            'word_overlap_similarity': float(word_overlap),
            'average_similarity': float((tfidf_similarity + lsi_similarity + word_overlap) / 3)
        }
    
    def analyze_text_complexity(self, text: str) -> Dict[str, Any]:
        """
        Analyze text complexity using various metrics:
        - Readability scores
        - Vocabulary diversity
        - Sentence structure analysis
        """
        sentences = sent_tokenize(text)
        words = word_tokenize(text.lower())
        
        # Basic metrics
        word_count = len(words)
        sentence_count = len(sentences)
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
        
        # Vocabulary analysis
        unique_words = set(words)
        vocabulary_diversity = len(unique_words) / word_count if word_count > 0 else 0
        
        # Word length analysis
        word_lengths = [len(word) for word in words if word.isalpha()]
        avg_word_length = np.mean(word_lengths) if word_lengths else 0
        
        # Syllable count estimation (simplified)
        syllable_count = sum(self._count_syllables(word) for word in unique_words if word.isalpha())
        
        # Flesch Reading Ease Score
        flesch_score = self._calculate_flesch_score(word_count, sentence_count, syllable_count)
        
        # Sentence complexity
        complex_sentences = sum(1 for sent in sentences if len(word_tokenize(sent)) > 20)
        sentence_complexity_ratio = complex_sentences / sentence_count if sentence_count > 0 else 0
        
        return {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'avg_sentence_length': float(avg_sentence_length),
            'vocabulary_diversity': float(vocabulary_diversity),
            'avg_word_length': float(avg_word_length),
            'syllable_count': syllable_count,
            'flesch_reading_ease': float(flesch_score),
            'sentence_complexity_ratio': float(sentence_complexity_ratio),
            'unique_words_count': len(unique_words)
        }
    
    def _count_syllables(self, word: str) -> int:
        """Simple syllable counting algorithm."""
        word = word.lower()
        count = 0
        vowels = "aeiouy"
        on_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not on_vowel:
                count += 1
            on_vowel = is_vowel
        
        if word.endswith("e"):
            count -= 1
        if count == 0:
            count = 1
        return count
    
    def _calculate_flesch_score(self, word_count: int, sentence_count: int, syllable_count: int) -> float:
        """Calculate Flesch Reading Ease Score."""
        if word_count == 0 or sentence_count == 0:
            return 0.0
        
        return 206.835 - (1.015 * (word_count / sentence_count)) - (84.6 * (syllable_count / word_count))
    
    def comprehensive_analysis(self, text1: str, text2: str) -> Dict[str, Any]:
        """
        Perform comprehensive analysis of two texts including:
        - Semantic similarity
        - Named entity recognition
        - Topic modeling
        - Text complexity analysis
        """
        # Semantic similarity
        similarity_scores = self.calculate_semantic_similarity(text1, text2)
        
        # Named entity recognition
        entities1 = self.extract_named_entities(text1)
        entities2 = self.extract_named_entities(text2)
        
        # Topic modeling
        topic_analysis = self.perform_topic_modeling([text1, text2])
        
        # Text complexity
        complexity1 = self.analyze_text_complexity(text1)
        complexity2 = self.analyze_text_complexity(text2)
        
        # Entity overlap analysis
        entity_overlap = self._analyze_entity_overlap(entities1, entities2)
        
        return {
            'similarity_scores': similarity_scores,
            'named_entities': {
                'text1': entities1,
                'text2': entities2,
                'overlap_analysis': entity_overlap
            },
            'topic_modeling': topic_analysis,
            'text_complexity': {
                'text1': complexity1,
                'text2': complexity2,
                'comparison': self._compare_complexity(complexity1, complexity2)
            }
        }
    
    def _analyze_entity_overlap(self, entities1: Dict[str, List[str]], entities2: Dict[str, List[str]]) -> Dict[str, Any]:
        """Analyze overlap between named entities in two texts."""
        all_entities1 = set()
        all_entities2 = set()
        
        for entities in entities1.values():
            all_entities1.update(entities)
        for entities in entities2.values():
            all_entities2.update(entities)
        
        intersection = all_entities1.intersection(all_entities2)
        union = all_entities1.union(all_entities2)
        
        overlap_ratio = len(intersection) / len(union) if len(union) > 0 else 0
        
        return {
            'common_entities': list(intersection),
            'unique_to_text1': list(all_entities1 - all_entities2),
            'unique_to_text2': list(all_entities2 - all_entities1),
            'overlap_ratio': float(overlap_ratio)
        }
    
    def _compare_complexity(self, complexity1: Dict[str, Any], complexity2: Dict[str, Any]) -> Dict[str, Any]:
        """Compare complexity metrics between two texts."""
        return {
            'readability_difference': complexity1['flesch_reading_ease'] - complexity2['flesch_reading_ease'],
            'vocabulary_diversity_difference': complexity1['vocabulary_diversity'] - complexity2['vocabulary_diversity'],
            'sentence_length_difference': complexity1['avg_sentence_length'] - complexity2['avg_sentence_length'],
            'word_count_difference': complexity1['word_count'] - complexity2['word_count']
        }

def analyze_comparison_results(results_file: str) -> Dict:
    """Analyze a file containing comparison results."""
    analyzer = AdvancedTextAnalyzer()
    
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
    import sys
    
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Please provide a results file path'}))
        sys.exit(1)
        
    results = analyze_comparison_results(sys.argv[1])
    print(json.dumps(results)) 