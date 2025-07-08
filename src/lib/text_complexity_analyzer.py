import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tag import pos_tag
import nltk
import re
from typing import Dict, List, Tuple, Any, Optional
import json
from collections import Counter
import math

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('wordnet', quiet=True)

class TextComplexityAnalyzer:
    """
    Advanced text complexity analysis including:
    - Lexical diversity metrics (TTR, Yule's K, Simpson's D)
    - Syntactic complexity analysis
    - Readability formulas (Flesch, Gunning Fog, SMOG)
    - Vocabulary sophistication metrics
    - Sentence structure analysis
    - Complexity scoring and classification
    """
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Common words for complexity analysis
        self.common_words = set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
        ])
        
        # Academic vocabulary list (simplified)
        self.academic_words = set([
            'analysis', 'approach', 'area', 'assessment', 'assume', 'authority',
            'available', 'benefit', 'concept', 'consistent', 'constitutional',
            'context', 'contract', 'create', 'data', 'definition', 'derived',
            'distribution', 'economic', 'environment', 'established', 'estimate',
            'evidence', 'export', 'factors', 'financial', 'formula', 'function',
            'identified', 'income', 'indicate', 'individual', 'interpretation',
            'involved', 'issues', 'labour', 'legal', 'legislation', 'major',
            'method', 'occur', 'percent', 'period', 'policy', 'principle',
            'procedure', 'process', 'required', 'research', 'response', 'role',
            'section', 'sector', 'significant', 'similar', 'source', 'specific',
            'structure', 'theory', 'variable'
        ])
    
    def calculate_lexical_diversity(self, text: str) -> Dict[str, float]:
        """
        Calculate various lexical diversity metrics:
        - Type-Token Ratio (TTR)
        - Yule's K (vocabulary richness)
        - Simpson's Diversity Index
        - Guiraud's Index
        """
        words = word_tokenize(text.lower())
        words = [word for word in words if word.isalpha() and word not in self.stop_words]
        
        if not words:
            return {'error': 'No valid words found'}
        
        # Basic counts
        total_tokens = len(words)
        unique_types = len(set(words))
        
        # Type-Token Ratio
        ttr = unique_types / total_tokens if total_tokens > 0 else 0
        
        # Yule's K (vocabulary richness)
        word_freq = Counter(words)
        yule_k = self._calculate_yules_k(word_freq, total_tokens)
        
        # Simpson's Diversity Index
        simpson_d = self._calculate_simpsons_d(word_freq, total_tokens)
        
        # Guiraud's Index
        guiraud_index = unique_types / math.sqrt(total_tokens) if total_tokens > 0 else 0
        
        # Honore's Statistic
        honore_stat = self._calculate_honore_stat(word_freq, total_tokens)
        
        return {
            'type_token_ratio': round(ttr, 4),
            'yules_k': round(yule_k, 4),
            'simpsons_diversity': round(simpson_d, 4),
            'guiraud_index': round(guiraud_index, 4),
            'honore_statistic': round(honore_stat, 4),
            'total_tokens': total_tokens,
            'unique_types': unique_types,
            'diversity_level': self._get_diversity_level(ttr)
        }
    
    def _calculate_yules_k(self, word_freq: Counter, total_tokens: int) -> float:
        """Calculate Yule's K statistic."""
        if total_tokens == 0:
            return 0.0
        
        sum_fi_squared = sum(freq ** 2 for freq in word_freq.values())
        return 10000 * (sum_fi_squared - total_tokens) / (total_tokens ** 2)
    
    def _calculate_simpsons_d(self, word_freq: Counter, total_tokens: int) -> float:
        """Calculate Simpson's Diversity Index."""
        if total_tokens == 0:
            return 0.0
        
        sum_fi_fi_minus_1 = sum(freq * (freq - 1) for freq in word_freq.values())
        return 1 - (sum_fi_fi_minus_1 / (total_tokens * (total_tokens - 1)))
    
    def _calculate_honore_stat(self, word_freq: Counter, total_tokens: int) -> float:
        """Calculate Honore's Statistic."""
        if total_tokens == 0:
            return 0.0
        
        hapax_legomena = sum(1 for freq in word_freq.values() if freq == 1)
        unique_types = len(word_freq)
        return 100 * math.log(total_tokens) / (1 - hapax_legomena / unique_types) if unique_types > hapax_legomena else 0
    
    def _get_diversity_level(self, ttr: float) -> str:
        """Get lexical diversity level based on TTR."""
        if ttr >= 0.8:
            return "Very High"
        elif ttr >= 0.6:
            return "High"
        elif ttr >= 0.4:
            return "Medium"
        elif ttr >= 0.2:
            return "Low"
        else:
            return "Very Low"
    
    def analyze_syntactic_complexity(self, text: str) -> Dict[str, Any]:
        """
        Analyze syntactic complexity including:
        - Average sentence length
        - Clause complexity
        - Subordination ratio
        - Coordination ratio
        - Phrase complexity
        """
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        pos_tags = pos_tag(words)
        
        # Basic sentence metrics
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        # Clause analysis (simplified)
        clause_complexity = self._analyze_clause_complexity(sentences)
        
        # Subordination analysis
        subordination_ratio = self._calculate_subordination_ratio(pos_tags)
        
        # Coordination analysis
        coordination_ratio = self._calculate_coordination_ratio(text)
        
        # Phrase complexity
        phrase_complexity = self._analyze_phrase_complexity(pos_tags)
        
        return {
            'avg_sentence_length': round(avg_sentence_length, 2),
            'clause_complexity': clause_complexity,
            'subordination_ratio': round(subordination_ratio, 4),
            'coordination_ratio': round(coordination_ratio, 4),
            'phrase_complexity': phrase_complexity,
            'syntactic_level': self._get_syntactic_level(avg_sentence_length, subordination_ratio)
        }
    
    def _analyze_clause_complexity(self, sentences: List[str]) -> Dict[str, Any]:
        """Analyze clause complexity in sentences."""
        total_clauses = 0
        complex_sentences = 0
        
        for sentence in sentences:
            # Count clauses (simplified approach)
            clauses = sentence.split(',') + sentence.split(';') + sentence.split(':')
            total_clauses += len(clauses)
            if len(clauses) > 2:
                complex_sentences += 1
        
        return {
            'total_clauses': total_clauses,
            'complex_sentences': complex_sentences,
            'avg_clauses_per_sentence': round(total_clauses / len(sentences), 2) if sentences else 0
        }
    
    def _calculate_subordination_ratio(self, pos_tags: List[Tuple[str, str]]) -> float:
        """Calculate subordination ratio based on POS tags."""
        subordinating_conjunctions = ['that', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how']
        subordinating_count = sum(1 for word, tag in pos_tags if word.lower() in subordinating_conjunctions)
        total_words = len(pos_tags)
        return subordinating_count / total_words if total_words > 0 else 0
    
    def _calculate_coordination_ratio(self, text: str) -> float:
        """Calculate coordination ratio."""
        coordinating_conjunctions = ['and', 'or', 'but', 'nor', 'for', 'yet', 'so']
        coordinating_count = sum(1 for word in word_tokenize(text.lower()) if word in coordinating_conjunctions)
        total_words = len(word_tokenize(text))
        return coordinating_count / total_words if total_words > 0 else 0
    
    def _analyze_phrase_complexity(self, pos_tags: List[Tuple[str, str]]) -> Dict[str, Any]:
        """Analyze phrase complexity."""
        # Count different phrase types
        noun_phrases = sum(1 for word, tag in pos_tags if tag.startswith('NN'))
        verb_phrases = sum(1 for word, tag in pos_tags if tag.startswith('VB'))
        adj_phrases = sum(1 for word, tag in pos_tags if tag.startswith('JJ'))
        adv_phrases = sum(1 for word, tag in pos_tags if tag.startswith('RB'))
        
        total_phrases = noun_phrases + verb_phrases + adj_phrases + adv_phrases
        
        return {
            'noun_phrases': noun_phrases,
            'verb_phrases': verb_phrases,
            'adjective_phrases': adj_phrases,
            'adverb_phrases': adv_phrases,
            'phrase_diversity': round(len(set(tag for word, tag in pos_tags)) / len(pos_tags), 3) if pos_tags else 0
        }
    
    def _get_syntactic_level(self, avg_sentence_length: float, subordination_ratio: float) -> str:
        """Get syntactic complexity level."""
        complexity_score = avg_sentence_length * 0.6 + subordination_ratio * 100 * 0.4
        
        if complexity_score >= 25:
            return "Very Complex"
        elif complexity_score >= 18:
            return "Complex"
        elif complexity_score >= 12:
            return "Moderate"
        elif complexity_score >= 8:
            return "Simple"
        else:
            return "Very Simple"
    
    def calculate_readability_scores(self, text: str) -> Dict[str, Any]:
        """
        Calculate multiple readability formulas:
        - Flesch Reading Ease
        - Flesch-Kincaid Grade Level
        - Gunning Fog Index
        - SMOG Index
        - Coleman-Liau Index
        """
        sentences = sent_tokenize(text)
        words = word_tokenize(text.lower())
        words = [word for word in words if word.isalpha()]
        
        if not sentences or not words:
            return {'error': 'Insufficient text for readability analysis'}
        
        sentence_count = len(sentences)
        word_count = len(words)
        syllable_count = sum(self._count_syllables(word) for word in words)
        
        # Flesch Reading Ease
        flesch_ease = 206.835 - (1.015 * (word_count / sentence_count)) - (84.6 * (syllable_count / word_count))
        
        # Flesch-Kincaid Grade Level
        flesch_grade = 0.39 * (word_count / sentence_count) + 11.8 * (syllable_count / word_count) - 15.59
        
        # Gunning Fog Index
        complex_words = sum(1 for word in words if self._count_syllables(word) > 2)
        fog_index = 0.4 * ((word_count / sentence_count) + 100 * (complex_words / word_count))
        
        # SMOG Index
        complex_sentences = sum(1 for sentence in sentences if sum(1 for word in word_tokenize(sentence.lower()) if self._count_syllables(word) > 2) >= 3)
        smog_index = 1.043 * math.sqrt(complex_sentences * (30 / sentence_count)) + 3.1291
        
        # Coleman-Liau Index
        avg_letters_per_word = sum(len(word) for word in words) / word_count
        avg_sentences_per_word = sentence_count / word_count
        coleman_liau = 0.0588 * avg_letters_per_word * 100 - 0.296 * avg_sentences_per_word * 100 - 15.8
        
        return {
            'flesch_reading_ease': round(flesch_ease, 2),
            'flesch_grade_level': round(flesch_grade, 1),
            'gunning_fog_index': round(fog_index, 2),
            'smog_index': round(smog_index, 2),
            'coleman_liau_index': round(coleman_liau, 2),
            'readability_level': self._get_readability_level(flesch_ease),
            'target_audience': self._get_target_audience(flesch_grade)
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
    
    def _get_target_audience(self, grade_level: float) -> str:
        """Get target audience based on grade level."""
        if grade_level <= 6:
            return "Elementary School"
        elif grade_level <= 8:
            return "Middle School"
        elif grade_level <= 12:
            return "High School"
        elif grade_level <= 16:
            return "College"
        else:
            return "Graduate Level"
    
    def analyze_vocabulary_sophistication(self, text: str) -> Dict[str, Any]:
        """
        Analyze vocabulary sophistication including:
        - Academic vocabulary usage
        - Rare word frequency
        - Vocabulary density
        - Word length distribution
        """
        words = word_tokenize(text.lower())
        words = [word for word in words if word.isalpha() and word not in self.stop_words]
        
        if not words:
            return {'error': 'No valid words found'}
        
        # Academic vocabulary analysis
        academic_words = [word for word in words if word in self.academic_words]
        academic_ratio = len(academic_words) / len(words) if words else 0
        
        # Rare word analysis (words with 6+ letters)
        rare_words = [word for word in words if len(word) >= 6]
        rare_word_ratio = len(rare_words) / len(words) if words else 0
        
        # Word length analysis
        word_lengths = [len(word) for word in words]
        avg_word_length = np.mean(word_lengths) if word_lengths else 0
        long_words = [word for word in words if len(word) >= 8]
        long_word_ratio = len(long_words) / len(words) if words else 0
        
        # Vocabulary density (unique words / total words)
        vocabulary_density = len(set(words)) / len(words) if words else 0
        
        return {
            'academic_vocabulary_count': len(academic_words),
            'academic_vocabulary_ratio': round(academic_ratio, 4),
            'rare_word_count': len(rare_words),
            'rare_word_ratio': round(rare_word_ratio, 4),
            'avg_word_length': round(avg_word_length, 2),
            'long_word_count': len(long_words),
            'long_word_ratio': round(long_word_ratio, 4),
            'vocabulary_density': round(vocabulary_density, 4),
            'sophistication_level': self._get_sophistication_level(academic_ratio, rare_word_ratio, avg_word_length)
        }
    
    def _get_sophistication_level(self, academic_ratio: float, rare_word_ratio: float, avg_word_length: float) -> str:
        """Get vocabulary sophistication level."""
        sophistication_score = academic_ratio * 0.4 + rare_word_ratio * 0.4 + (avg_word_length - 4) * 0.2
        
        if sophistication_score >= 0.3:
            return "Very Sophisticated"
        elif sophistication_score >= 0.2:
            return "Sophisticated"
        elif sophistication_score >= 0.1:
            return "Moderate"
        elif sophistication_score >= 0.05:
            return "Basic"
        else:
            return "Simple"
    
    def calculate_complexity_score(self, text: str) -> Dict[str, Any]:
        """
        Calculate overall complexity score combining all metrics.
        Returns a comprehensive complexity analysis.
        """
        # Get all analysis components
        lexical_diversity = self.calculate_lexical_diversity(text)
        syntactic_complexity = self.analyze_syntactic_complexity(text)
        readability_scores = self.calculate_readability_scores(text)
        vocabulary_sophistication = self.analyze_vocabulary_sophistication(text)
        
        # Calculate overall complexity score
        complexity_factors = []
        
        # Lexical diversity factor (25%)
        if 'type_token_ratio' in lexical_diversity:
            ttr = lexical_diversity['type_token_ratio']
            complexity_factors.append(ttr * 0.25)
        
        # Syntactic complexity factor (25%)
        avg_sent_len = syntactic_complexity.get('avg_sentence_length', 0)
        subordination = syntactic_complexity.get('subordination_ratio', 0)
        syntactic_factor = (avg_sent_len / 20) * 0.15 + (subordination * 10) * 0.1
        complexity_factors.append(syntactic_factor)
        
        # Readability factor (25%)
        flesch_score = readability_scores.get('flesch_reading_ease', 50)
        readability_factor = (100 - flesch_score) / 100 * 0.25  # Invert so higher = more complex
        complexity_factors.append(readability_factor)
        
        # Vocabulary sophistication factor (25%)
        if 'academic_vocabulary_ratio' in vocabulary_sophistication:
            academic_ratio = vocabulary_sophistication['academic_vocabulary_ratio']
            rare_ratio = vocabulary_sophistication['rare_word_ratio']
            vocab_factor = (academic_ratio + rare_ratio) * 0.25
            complexity_factors.append(vocab_factor)
        
        # Calculate overall score
        overall_complexity = sum(complexity_factors) if complexity_factors else 0
        
        return {
            'overall_complexity_score': round(overall_complexity, 3),
            'complexity_level': self._get_complexity_level(overall_complexity),
            'lexical_diversity': lexical_diversity,
            'syntactic_complexity': syntactic_complexity,
            'readability_scores': readability_scores,
            'vocabulary_sophistication': vocabulary_sophistication,
            'complexity_breakdown': {
                'lexical_factor': round(complexity_factors[0] if len(complexity_factors) > 0 else 0, 3),
                'syntactic_factor': round(complexity_factors[1] if len(complexity_factors) > 1 else 0, 3),
                'readability_factor': round(complexity_factors[2] if len(complexity_factors) > 2 else 0, 3),
                'vocabulary_factor': round(complexity_factors[3] if len(complexity_factors) > 3 else 0, 3)
            }
        }
    
    def _get_complexity_level(self, complexity_score: float) -> str:
        """Get overall complexity level."""
        if complexity_score >= 0.7:
            return "Very Complex"
        elif complexity_score >= 0.5:
            return "Complex"
        elif complexity_score >= 0.3:
            return "Moderate"
        elif complexity_score >= 0.1:
            return "Simple"
        else:
            return "Very Simple"
    
    def compare_text_complexity(self, text1: str, text2: str) -> Dict[str, Any]:
        """
        Compare complexity between two texts.
        Returns detailed comparison analysis.
        """
        complexity1 = self.calculate_complexity_score(text1)
        complexity2 = self.calculate_complexity_score(text2)
        
        # Calculate differences
        score_diff = abs(complexity1['overall_complexity_score'] - complexity2['overall_complexity_score'])
        
        # Determine which text is more complex
        if complexity1['overall_complexity_score'] > complexity2['overall_complexity_score']:
            more_complex = "Text 1"
            complexity_difference = complexity1['overall_complexity_score'] - complexity2['overall_complexity_score']
        else:
            more_complex = "Text 2"
            complexity_difference = complexity2['overall_complexity_score'] - complexity1['overall_complexity_score']
        
        return {
            'text1_complexity': complexity1,
            'text2_complexity': complexity2,
            'complexity_difference': round(score_diff, 3),
            'more_complex_text': more_complex,
            'complexity_gap': round(complexity_difference, 3),
            'comparison_summary': {
                'lexical_difference': abs(complexity1['lexical_diversity'].get('type_token_ratio', 0) - 
                                        complexity2['lexical_diversity'].get('type_token_ratio', 0)),
                'syntactic_difference': abs(complexity1['syntactic_complexity'].get('avg_sentence_length', 0) - 
                                          complexity2['syntactic_complexity'].get('avg_sentence_length', 0)),
                'readability_difference': abs(complexity1['readability_scores'].get('flesch_reading_ease', 50) - 
                                            complexity2['readability_scores'].get('flesch_reading_ease', 50)),
                'vocabulary_difference': abs(complexity1['vocabulary_sophistication'].get('academic_vocabulary_ratio', 0) - 
                                           complexity2['vocabulary_sophistication'].get('academic_vocabulary_ratio', 0))
            }
        }

def analyze_text_complexity(text: str) -> Dict[str, Any]:
    """Analyze text complexity for a single text."""
    analyzer = TextComplexityAnalyzer()
    return analyzer.calculate_complexity_score(text)

def compare_texts_complexity(text1: str, text2: str) -> Dict[str, Any]:
    """Compare complexity between two texts."""
    analyzer = TextComplexityAnalyzer()
    return analyzer.compare_text_complexity(text1, text2)

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Please provide text to analyze'}))
        sys.exit(1)
    
    text = sys.argv[1]
    if len(sys.argv) == 3:
        # Compare two texts
        text2 = sys.argv[2]
        result = compare_texts_complexity(text, text2)
    else:
        # Analyze single text
        result = analyze_text_complexity(text)
    
    print(json.dumps(result)) 