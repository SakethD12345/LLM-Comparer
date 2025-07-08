import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import re
from typing import Dict, List, Tuple, Any, Optional
import json
from collections import Counter, defaultdict
import networkx as nx
import matplotlib.pyplot as plt
import io
import base64
import sys

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('vader_lexicon', quiet=True)

class ConversationAnalyzer:
    """
    Advanced conversation analysis for multi-turn dialogues including:
    - Conversation flow analysis
    - Turn-taking patterns
    - Topic evolution tracking
    - Sentiment progression
    - Response consistency analysis
    - Conversation graph visualization
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=500
        )
        self.stop_words = set(stopwords.words('english'))
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
    
    def analyze_conversation_flow(self, conversation: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze the flow and structure of a conversation.
        
        Args:
            conversation: List of message dictionaries with 'role', 'content', 'model' keys
        
        Returns:
            Dictionary containing flow analysis results
        """
        if not conversation:
            return {'error': 'Empty conversation'}
        
        # Extract messages and roles
        messages = [msg['content'] for msg in conversation]
        roles = [msg.get('role', 'user') for msg in conversation]
        models = [msg.get('model', 'unknown') for msg in conversation]
        
        # Basic statistics
        total_messages = len(messages)
        user_messages = sum(1 for role in roles if role == 'user')
        assistant_messages = total_messages - user_messages
        
        # Message length analysis
        message_lengths = [len(msg.split()) for msg in messages]
        avg_message_length = np.mean(message_lengths) if message_lengths else 0
        
        # Turn-taking analysis
        turn_patterns = self._analyze_turn_patterns(roles)
        
        # Response time patterns (if timestamps available)
        response_times = self._analyze_response_times(conversation)
        
        # Conversation depth analysis
        depth_analysis = self._analyze_conversation_depth(messages)
        
        return {
            'basic_stats': {
                'total_messages': total_messages,
                'user_messages': user_messages,
                'assistant_messages': assistant_messages,
                'avg_message_length': round(avg_message_length, 2),
                'conversation_ratio': round(assistant_messages / user_messages, 2) if user_messages > 0 else 0
            },
            'turn_patterns': turn_patterns,
            'response_times': response_times,
            'depth_analysis': depth_analysis
        }
    
    def _analyze_turn_patterns(self, roles: List[str]) -> Dict[str, Any]:
        """Analyze turn-taking patterns in the conversation."""
        if len(roles) < 2:
            return {'error': 'Insufficient turns for analysis'}
        
        # Count consecutive turns
        consecutive_user = 0
        consecutive_assistant = 0
        max_consecutive_user = 0
        max_consecutive_assistant = 0
        
        for role in roles:
            if role == 'user':
                consecutive_user += 1
                consecutive_assistant = 0
                max_consecutive_user = max(max_consecutive_user, consecutive_user)
            else:
                consecutive_assistant += 1
                consecutive_user = 0
                max_consecutive_assistant = max(max_consecutive_assistant, consecutive_assistant)
        
        # Analyze turn transitions
        transitions = []
        for i in range(len(roles) - 1):
            current_role = roles[i]
            next_role = roles[i + 1]
            transitions.append(f"{current_role}_to_{next_role}")
        
        transition_counts = Counter(transitions)
        
        return {
            'max_consecutive_user': max_consecutive_user,
            'max_consecutive_assistant': max_consecutive_assistant,
            'transition_patterns': dict(transition_counts),
            'total_transitions': len(transitions)
        }
    
    def _analyze_response_times(self, conversation: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze response time patterns if timestamps are available."""
        timestamps = [msg.get('timestamp') for msg in conversation]
        
        if not any(timestamps):
            return {'error': 'No timestamp data available'}
        
        # Calculate response times
        response_times = []
        for i in range(1, len(timestamps)):
            if timestamps[i] and timestamps[i-1]:
                try:
                    time_diff = timestamps[i] - timestamps[i-1]
                    response_times.append(time_diff)
                except:
                    continue
        
        if not response_times:
            return {'error': 'Could not calculate response times'}
        
        return {
            'avg_response_time': round(np.mean(response_times), 2),
            'median_response_time': round(np.median(response_times), 2),
            'min_response_time': round(min(response_times), 2),
            'max_response_time': round(max(response_times), 2),
            'response_time_variance': round(np.var(response_times), 2)
        }
    
    def _analyze_conversation_depth(self, messages: List[str]) -> Dict[str, Any]:
        """Analyze conversation depth and complexity."""
        # Calculate cumulative context length
        cumulative_lengths = []
        total_length = 0
        
        for msg in messages:
            total_length += len(msg.split())
            cumulative_lengths.append(total_length)
        
        # Analyze depth progression
        depth_progression = []
        for i, length in enumerate(cumulative_lengths):
            depth_progression.append({
                'turn': i + 1,
                'cumulative_length': length,
                'depth_level': self._get_depth_level(length)
            })
        
        return {
            'final_depth': cumulative_lengths[-1] if cumulative_lengths else 0,
            'depth_progression': depth_progression,
            'avg_depth_per_turn': round(np.mean(cumulative_lengths), 2) if cumulative_lengths else 0
        }
    
    def _get_depth_level(self, cumulative_length: int) -> str:
        """Get conversation depth level based on cumulative length."""
        if cumulative_length < 100:
            return "Shallow"
        elif cumulative_length < 300:
            return "Moderate"
        elif cumulative_length < 600:
            return "Deep"
        else:
            return "Very Deep"
    
    def analyze_topic_evolution(self, conversation: List[Dict[str, Any]], window_size: int = 3) -> Dict[str, Any]:
        """
        Analyze how topics evolve throughout the conversation.
        
        Args:
            conversation: List of message dictionaries
            window_size: Number of messages to consider for each topic window
        
        Returns:
            Dictionary containing topic evolution analysis
        """
        messages = [msg['content'] for msg in conversation]
        
        if len(messages) < window_size:
            return {'error': f'Need at least {window_size} messages for topic evolution analysis'}
        
        # Create sliding windows
        topic_windows = []
        for i in range(len(messages) - window_size + 1):
            window_text = ' '.join(messages[i:i + window_size])
            topic_windows.append({
                'window_id': i,
                'start_turn': i + 1,
                'end_turn': i + window_size,
                'text': window_text
            })
        
        # Analyze topic similarity between consecutive windows
        topic_similarities = []
        for i in range(len(topic_windows) - 1):
            similarity = self._calculate_text_similarity(
                topic_windows[i]['text'],
                topic_windows[i + 1]['text']
            )
            topic_similarities.append({
                'window_pair': f"{i+1}-{i+2}",
                'similarity': round(similarity, 3),
                'topic_shift': 'High' if similarity < 0.3 else 'Medium' if similarity < 0.6 else 'Low'
            })
        
        # Identify major topic shifts
        major_shifts = [s for s in topic_similarities if s['similarity'] < 0.3]
        
        return {
            'total_windows': len(topic_windows),
            'topic_similarities': topic_similarities,
            'major_topic_shifts': len(major_shifts),
            'avg_topic_similarity': round(np.mean([s['similarity'] for s in topic_similarities]), 3) if topic_similarities else 0,
            'topic_evolution_trend': self._get_topic_evolution_trend(topic_similarities)
        }
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts using TF-IDF."""
        try:
            texts = [text1.lower(), text2.lower()]
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except:
            return 0.0
    
    def _get_topic_evolution_trend(self, similarities: List[Dict[str, Any]]) -> str:
        """Determine the overall trend of topic evolution."""
        if not similarities:
            return "Insufficient data"
        
        similarity_values = [s['similarity'] for s in similarities]
        
        if len(similarity_values) < 2:
            return "Stable"
        
        # Calculate trend
        trend = np.polyfit(range(len(similarity_values)), similarity_values, 1)[0]
        
        if trend > 0.05:
            return "Converging"
        elif trend < -0.05:
            return "Diverging"
        else:
            return "Stable"
    
    def analyze_sentiment_progression(self, conversation: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze how sentiment changes throughout the conversation.
        
        Args:
            conversation: List of message dictionaries
        
        Returns:
            Dictionary containing sentiment progression analysis
        """
        messages = [msg['content'] for msg in conversation]
        roles = [msg.get('role', 'user') for msg in conversation]
        
        # Analyze sentiment for each message
        sentiment_progression = []
        for i, (msg, role) in enumerate(zip(messages, roles)):
            sentiment_scores = self.sentiment_analyzer.polarity_scores(msg)
            sentiment_progression.append({
                'turn': i + 1,
                'role': role,
                'compound': round(sentiment_scores['compound'], 3),
                'positive': round(sentiment_scores['pos'], 3),
                'negative': round(sentiment_scores['neg'], 3),
                'neutral': round(sentiment_scores['neu'], 3)
            })
        
        # Calculate sentiment trends
        compound_scores = [s['compound'] for s in sentiment_progression]
        
        # Analyze sentiment volatility
        sentiment_volatility = np.std(compound_scores) if len(compound_scores) > 1 else 0
        
        # Identify sentiment patterns
        sentiment_patterns = self._identify_sentiment_patterns(sentiment_progression)
        
        return {
            'sentiment_progression': sentiment_progression,
            'overall_sentiment_trend': self._calculate_sentiment_trend(compound_scores),
            'sentiment_volatility': round(sentiment_volatility, 3),
            'sentiment_patterns': sentiment_patterns,
            'avg_sentiment': round(np.mean(compound_scores), 3) if compound_scores else 0
        }
    
    def _identify_sentiment_patterns(self, sentiment_progression: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Identify patterns in sentiment progression."""
        compound_scores = [s['compound'] for s in sentiment_progression]
        
        # Count sentiment transitions
        positive_turns = sum(1 for score in compound_scores if score > 0.05)
        negative_turns = sum(1 for score in compound_scores if score < -0.05)
        neutral_turns = len(compound_scores) - positive_turns - negative_turns
        
        # Identify sentiment swings
        sentiment_swings = 0
        for i in range(1, len(compound_scores)):
            prev_score = compound_scores[i-1]
            curr_score = compound_scores[i]
            if (prev_score > 0.1 and curr_score < -0.1) or (prev_score < -0.1 and curr_score > 0.1):
                sentiment_swings += 1
        
        return {
            'positive_turns': positive_turns,
            'negative_turns': negative_turns,
            'neutral_turns': neutral_turns,
            'sentiment_swings': sentiment_swings,
            'dominant_sentiment': 'Positive' if positive_turns > negative_turns else 'Negative' if negative_turns > positive_turns else 'Neutral'
        }
    
    def _calculate_sentiment_trend(self, compound_scores: List[float]) -> str:
        """Calculate the overall sentiment trend."""
        if len(compound_scores) < 2:
            return "Insufficient data"
        
        # Calculate linear trend
        x = np.arange(len(compound_scores))
        trend = np.polyfit(x, compound_scores, 1)[0]
        
        if trend > 0.01:
            return "Improving"
        elif trend < -0.01:
            return "Declining"
        else:
            return "Stable"
    
    def analyze_response_consistency(self, conversation: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze consistency of responses across the conversation.
        
        Args:
            conversation: List of message dictionaries
        
        Returns:
            Dictionary containing consistency analysis
        """
        # Separate user and assistant messages
        user_messages = [msg['content'] for msg in conversation if msg.get('role') == 'user']
        assistant_messages = [msg['content'] for msg in conversation if msg.get('role') != 'user']
        
        if len(assistant_messages) < 2:
            return {'error': 'Need at least 2 assistant responses for consistency analysis'}
        
        # Calculate pairwise similarities between assistant responses
        response_similarities = []
        for i in range(len(assistant_messages)):
            for j in range(i + 1, len(assistant_messages)):
                similarity = self._calculate_text_similarity(
                    assistant_messages[i],
                    assistant_messages[j]
                )
                response_similarities.append({
                    'response_pair': f"{i+1}-{j+1}",
                    'similarity': round(similarity, 3)
                })
        
        # Calculate consistency metrics
        similarity_values = [s['similarity'] for s in response_similarities]
        avg_consistency = np.mean(similarity_values) if similarity_values else 0
        consistency_variance = np.var(similarity_values) if similarity_values else 0
        
        # Analyze response length consistency
        response_lengths = [len(msg.split()) for msg in assistant_messages]
        length_consistency = np.std(response_lengths) if response_lengths else 0
        
        return {
            'response_similarities': response_similarities,
            'avg_consistency': round(avg_consistency, 3),
            'consistency_variance': round(consistency_variance, 3),
            'length_consistency': round(length_consistency, 2),
            'consistency_level': self._get_consistency_level(avg_consistency),
            'total_response_pairs': len(response_similarities)
        }
    
    def _get_consistency_level(self, avg_consistency: float) -> str:
        """Get consistency level based on average similarity."""
        if avg_consistency >= 0.7:
            return "High"
        elif avg_consistency >= 0.4:
            return "Medium"
        else:
            return "Low"
    
    def generate_conversation_graph(self, conversation: List[Dict[str, Any]]) -> str:
        """
        Generate a conversation graph visualization.
        
        Args:
            conversation: List of message dictionaries
        
        Returns:
            Base64 encoded image of the conversation graph
        """
        try:
            # Create graph
            G = nx.DiGraph()
            
            # Add nodes for each message
            for i, msg in enumerate(conversation):
                role = msg.get('role', 'user')
                content_preview = msg['content'][:30] + "..." if len(msg['content']) > 30 else msg['content']
                
                G.add_node(i, 
                          role=role, 
                          content=content_preview,
                          length=len(msg['content'].split()))
            
            # Add edges between consecutive messages
            for i in range(len(conversation) - 1):
                G.add_edge(i, i + 1)
            
            # Create visualization
            plt.figure(figsize=(12, 8))
            pos = nx.spring_layout(G, k=3, iterations=50)
            
            # Color nodes by role
            node_colors = ['lightblue' if G.nodes[node]['role'] == 'user' else 'lightgreen' 
                          for node in G.nodes()]
            
            # Draw the graph
            nx.draw(G, pos, 
                   node_color=node_colors,
                   node_size=[G.nodes[node]['length'] * 50 for node in G.nodes()],
                   with_labels=True,
                   font_size=8,
                   font_weight='bold',
                   arrows=True,
                   edge_color='gray',
                   alpha=0.7)
            
            # Add legend
            plt.text(0.02, 0.98, 'User', transform=plt.gca().transAxes, 
                    bbox=dict(boxstyle="round,pad=0.3", facecolor="lightblue", alpha=0.7))
            plt.text(0.02, 0.93, 'Assistant', transform=plt.gca().transAxes, 
                    bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgreen", alpha=0.7))
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=150)
            plt.close()
            
            img_buffer.seek(0)
            img_str = base64.b64encode(img_buffer.getvalue()).decode()
            return img_str
            
        except Exception as e:
            return ""
    
    def comprehensive_conversation_analysis(self, conversation: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Perform comprehensive analysis of a conversation.
        
        Args:
            conversation: List of message dictionaries
        
        Returns:
            Dictionary containing all analysis results
        """
        # Perform all analyses
        flow_analysis = self.analyze_conversation_flow(conversation)
        topic_evolution = self.analyze_topic_evolution(conversation)
        sentiment_progression = self.analyze_sentiment_progression(conversation)
        response_consistency = self.analyze_response_consistency(conversation)
        conversation_graph = self.generate_conversation_graph(conversation)
        
        # Calculate overall conversation quality score
        quality_score = self._calculate_conversation_quality(
            flow_analysis, topic_evolution, sentiment_progression, response_consistency
        )
        
        return {
            'flow_analysis': flow_analysis,
            'topic_evolution': topic_evolution,
            'sentiment_progression': sentiment_progression,
            'response_consistency': response_consistency,
            'conversation_graph': conversation_graph,
            'quality_score': quality_score,
            'summary': self._generate_conversation_summary(
                flow_analysis, topic_evolution, sentiment_progression, response_consistency
            )
        }
    
    def _calculate_conversation_quality(self, flow: Dict, topic: Dict, sentiment: Dict, consistency: Dict) -> float:
        """Calculate overall conversation quality score."""
        score = 0.0
        
        # Flow quality (30%)
        if 'basic_stats' in flow:
            ratio = flow['basic_stats'].get('conversation_ratio', 0)
            if 0.5 <= ratio <= 2.0:  # Good balance
                score += 0.3
            elif 0.3 <= ratio <= 3.0:  # Acceptable
                score += 0.2
            else:
                score += 0.1
        
        # Topic evolution quality (25%)
        if 'avg_topic_similarity' in topic:
            similarity = topic['avg_topic_similarity']
            if 0.3 <= similarity <= 0.7:  # Good balance
                score += 0.25
            elif 0.2 <= similarity <= 0.8:  # Acceptable
                score += 0.15
            else:
                score += 0.05
        
        # Sentiment quality (25%)
        if 'sentiment_volatility' in sentiment:
            volatility = sentiment['sentiment_volatility']
            if volatility < 0.3:  # Low volatility is good
                score += 0.25
            elif volatility < 0.5:  # Medium volatility
                score += 0.15
            else:
                score += 0.05
        
        # Consistency quality (20%)
        if 'avg_consistency' in consistency:
            consistency_score = consistency['avg_consistency']
            if consistency_score >= 0.5:  # High consistency
                score += 0.2
            elif consistency_score >= 0.3:  # Medium consistency
                score += 0.1
            else:
                score += 0.05
        
        return round(score, 3)
    
    def _generate_conversation_summary(self, flow: Dict, topic: Dict, sentiment: Dict, consistency: Dict) -> Dict[str, Any]:
        """Generate a summary of the conversation analysis."""
        summary = {
            'conversation_balance': 'Balanced' if flow.get('basic_stats', {}).get('conversation_ratio', 0) > 0.5 else 'Unbalanced',
            'topic_coherence': topic.get('topic_evolution_trend', 'Unknown'),
            'sentiment_stability': 'Stable' if sentiment.get('sentiment_volatility', 1) < 0.3 else 'Volatile',
            'response_consistency': consistency.get('consistency_level', 'Unknown'),
            'key_insights': []
        }
        
        # Generate insights
        if flow.get('basic_stats', {}).get('conversation_ratio', 0) < 0.5:
            summary['key_insights'].append("Conversation may be too one-sided")
        
        if topic.get('major_topic_shifts', 0) > 3:
            summary['key_insights'].append("Multiple topic shifts detected")
        
        if sentiment.get('sentiment_swings', 0) > 2:
            summary['key_insights'].append("Significant sentiment swings observed")
        
        if consistency.get('avg_consistency', 0) < 0.3:
            summary['key_insights'].append("Low response consistency detected")
        
        if not summary['key_insights']:
            summary['key_insights'].append("Conversation shows good overall quality")
        
        return summary

def analyze_conversation_file(conversation_file: str) -> Dict[str, Any]:
    """Analyze a conversation from a JSON file."""
    analyzer = ConversationAnalyzer()
    
    try:
        with open(conversation_file, 'r') as f:
            conversation = json.load(f)
        
        if not conversation:
            return {'error': 'Empty conversation file'}
        
        return analyzer.comprehensive_conversation_analysis(conversation)
    
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Please provide a conversation file path'}))
        sys.exit(1)
        
    results = analyze_conversation_file(sys.argv[1])
    print(json.dumps(results)) 