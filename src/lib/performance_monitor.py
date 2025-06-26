"""
Performance Monitoring and Benchmarking System for LLM Comparer

This module provides comprehensive performance tracking, benchmarking,
and monitoring capabilities for LLM model comparisons.
"""

import time
import json
import sqlite3
import threading
import psutil
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import statistics
import pickle
import os
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelPerformanceMetric:
    """Data class for storing model performance metrics."""
    model_name: str
    timestamp: datetime
    response_time: float
    token_count: int
    tokens_per_second: float
    memory_usage: float
    cpu_usage: float
    error_rate: float
    response_quality_score: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            **asdict(self),
            'timestamp': self.timestamp.isoformat()
        }

@dataclass
class ComparisonMetrics:
    """Data class for storing comparison-specific metrics."""
    comparison_id: str
    model1_name: str
    model2_name: str
    prompt: str
    timestamp: datetime
    model1_response_time: float
    model2_response_time: float
    similarity_score: float
    user_preference: Optional[str]
    complexity_difference: float
    semantic_similarity: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            **asdict(self),
            'timestamp': self.timestamp.isoformat()
        }

class PerformanceDatabase:
    """SQLite database for storing performance metrics."""
    
    def __init__(self, db_path: str = "performance_metrics.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Model performance metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS model_performance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    model_name TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    response_time REAL NOT NULL,
                    token_count INTEGER,
                    tokens_per_second REAL,
                    memory_usage REAL,
                    cpu_usage REAL,
                    error_rate REAL,
                    response_quality_score REAL
                )
            """)
            
            # Comparison metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS comparison_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comparison_id TEXT NOT NULL,
                    model1_name TEXT NOT NULL,
                    model2_name TEXT NOT NULL,
                    prompt TEXT,
                    timestamp TEXT NOT NULL,
                    model1_response_time REAL,
                    model2_response_time REAL,
                    similarity_score REAL,
                    user_preference TEXT,
                    complexity_difference REAL,
                    semantic_similarity REAL
                )
            """)
            
            # System metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    cpu_percent REAL,
                    memory_percent REAL,
                    disk_usage REAL,
                    network_io_sent REAL,
                    network_io_recv REAL,
                    active_comparisons INTEGER
                )
            """)
            
            conn.commit()
    
    def insert_model_performance(self, metric: ModelPerformanceMetric):
        """Insert model performance metric into database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO model_performance 
                (model_name, timestamp, response_time, token_count, tokens_per_second,
                 memory_usage, cpu_usage, error_rate, response_quality_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                metric.model_name,
                metric.timestamp.isoformat(),
                metric.response_time,
                metric.token_count,
                metric.tokens_per_second,
                metric.memory_usage,
                metric.cpu_usage,
                metric.error_rate,
                metric.response_quality_score
            ))
            conn.commit()
    
    def insert_comparison_metric(self, metric: ComparisonMetrics):
        """Insert comparison metric into database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO comparison_metrics 
                (comparison_id, model1_name, model2_name, prompt, timestamp,
                 model1_response_time, model2_response_time, similarity_score,
                 user_preference, complexity_difference, semantic_similarity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                metric.comparison_id,
                metric.model1_name,
                metric.model2_name,
                metric.prompt,
                metric.timestamp.isoformat(),
                metric.model1_response_time,
                metric.model2_response_time,
                metric.similarity_score,
                metric.user_preference,
                metric.complexity_difference,
                metric.semantic_similarity
            ))
            conn.commit()
    
    def get_model_performance_history(self, model_name: str, hours: int = 24) -> List[Dict]:
        """Get performance history for a specific model."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            since = (datetime.now() - timedelta(hours=hours)).isoformat()
            
            cursor.execute("""
                SELECT * FROM model_performance 
                WHERE model_name = ? AND timestamp > ?
                ORDER BY timestamp DESC
            """, (model_name, since))
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    def get_comparison_analytics(self, hours: int = 24) -> Dict[str, Any]:
        """Get comparison analytics for the specified time period."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            since = (datetime.now() - timedelta(hours=hours)).isoformat()
            
            # Total comparisons
            cursor.execute("""
                SELECT COUNT(*) FROM comparison_metrics WHERE timestamp > ?
            """, (since,))
            total_comparisons = cursor.fetchone()[0]
            
            # Average similarity score
            cursor.execute("""
                SELECT AVG(similarity_score) FROM comparison_metrics 
                WHERE timestamp > ? AND similarity_score IS NOT NULL
            """, (since,))
            avg_similarity = cursor.fetchone()[0] or 0
            
            # Most compared models
            cursor.execute("""
                SELECT model1_name, model2_name, COUNT(*) as count
                FROM comparison_metrics WHERE timestamp > ?
                GROUP BY model1_name, model2_name
                ORDER BY count DESC LIMIT 5
            """, (since,))
            top_comparisons = cursor.fetchall()
            
            return {
                'total_comparisons': total_comparisons,
                'average_similarity': avg_similarity,
                'top_model_pairs': top_comparisons,
                'time_period_hours': hours
            }

class PerformanceMonitor:
    """Main performance monitoring class."""
    
    def __init__(self, db_path: str = "performance_metrics.db"):
        self.db = PerformanceDatabase(db_path)
        self.active_sessions = {}
        self.system_metrics_history = deque(maxlen=1000)
        self.model_metrics_cache = defaultdict(lambda: deque(maxlen=100))
        self.monitoring_active = False
        self.monitoring_thread = None
        
    def start_monitoring(self, interval: int = 30):
        """Start system monitoring in background thread."""
        if self.monitoring_active:
            return
        
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(
            target=self._monitor_system_metrics,
            args=(interval,),
            daemon=True
        )
        self.monitoring_thread.start()
        logger.info(f"Started system monitoring with {interval}s interval")
    
    def stop_monitoring(self):
        """Stop system monitoring."""
        self.monitoring_active = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
        logger.info("Stopped system monitoring")
    
    def _monitor_system_metrics(self, interval: int):
        """Monitor system metrics in background."""
        while self.monitoring_active:
            try:
                # Collect system metrics
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                network = psutil.net_io_counters()
                
                system_metric = {
                    'timestamp': datetime.now(),
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'disk_usage': disk.percent,
                    'network_io_sent': network.bytes_sent,
                    'network_io_recv': network.bytes_recv,
                    'active_comparisons': len(self.active_sessions)
                }
                
                self.system_metrics_history.append(system_metric)
                
                # Store in database
                with sqlite3.connect(self.db.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO system_metrics 
                        (timestamp, cpu_percent, memory_percent, disk_usage,
                         network_io_sent, network_io_recv, active_comparisons)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        system_metric['timestamp'].isoformat(),
                        system_metric['cpu_percent'],
                        system_metric['memory_percent'],
                        system_metric['disk_usage'],
                        system_metric['network_io_sent'],
                        system_metric['network_io_recv'],
                        system_metric['active_comparisons']
                    ))
                    conn.commit()
                
                time.sleep(interval)
                
            except Exception as e:
                logger.error(f"Error monitoring system metrics: {e}")
                time.sleep(interval)
    
    def start_model_session(self, session_id: str, model_name: str) -> Dict[str, Any]:
        """Start tracking a model session."""
        session_data = {
            'model_name': model_name,
            'start_time': time.time(),
            'start_memory': psutil.Process().memory_info().rss / 1024 / 1024,  # MB
            'start_cpu': psutil.cpu_percent(),
            'token_count': 0,
            'errors': 0
        }
        
        self.active_sessions[session_id] = session_data
        return session_data
    
    def end_model_session(self, session_id: str, token_count: int = 0, 
                         had_error: bool = False, quality_score: float = 0.0) -> ModelPerformanceMetric:
        """End tracking a model session and record metrics."""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        end_time = time.time()
        response_time = end_time - session['start_time']
        
        # Calculate metrics
        current_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        memory_usage = current_memory - session['start_memory']
        
        tokens_per_second = token_count / response_time if response_time > 0 else 0
        error_rate = 1.0 if had_error else 0.0
        
        # Create performance metric
        metric = ModelPerformanceMetric(
            model_name=session['model_name'],
            timestamp=datetime.now(),
            response_time=response_time,
            token_count=token_count,
            tokens_per_second=tokens_per_second,
            memory_usage=memory_usage,
            cpu_usage=psutil.cpu_percent(),
            error_rate=error_rate,
            response_quality_score=quality_score
        )
        
        # Store in database
        self.db.insert_model_performance(metric)
        
        # Cache in memory
        self.model_metrics_cache[session['model_name']].append(metric)
        
        # Clean up session
        del self.active_sessions[session_id]
        
        return metric
    
    def record_comparison(self, comparison_id: str, model1_name: str, model2_name: str,
                         prompt: str, model1_time: float, model2_time: float,
                         similarity_score: float = 0.0, user_preference: str = None,
                         complexity_diff: float = 0.0, semantic_sim: float = 0.0) -> ComparisonMetrics:
        """Record a comparison between two models."""
        metric = ComparisonMetrics(
            comparison_id=comparison_id,
            model1_name=model1_name,
            model2_name=model2_name,
            prompt=prompt,
            timestamp=datetime.now(),
            model1_response_time=model1_time,
            model2_response_time=model2_time,
            similarity_score=similarity_score,
            user_preference=user_preference,
            complexity_difference=complexity_diff,
            semantic_similarity=semantic_sim
        )
        
        self.db.insert_comparison_metric(metric)
        return metric
    
    def get_model_benchmark(self, model_name: str, hours: int = 24) -> Dict[str, Any]:
        """Get comprehensive benchmark data for a model."""
        history = self.db.get_model_performance_history(model_name, hours)
        
        if not history:
            return {
                'model_name': model_name,
                'no_data': True,
                'message': 'No performance data available for this time period'
            }
        
        # Calculate statistics
        response_times = [h['response_time'] for h in history]
        tokens_per_sec = [h['tokens_per_second'] for h in history if h['tokens_per_second']]
        memory_usage = [h['memory_usage'] for h in history if h['memory_usage']]
        quality_scores = [h['response_quality_score'] for h in history if h['response_quality_score']]
        
        benchmark = {
            'model_name': model_name,
            'time_period_hours': hours,
            'total_requests': len(history),
            'response_time_stats': {
                'mean': statistics.mean(response_times),
                'median': statistics.median(response_times),
                'min': min(response_times),
                'max': max(response_times),
                'std_dev': statistics.stdev(response_times) if len(response_times) > 1 else 0
            },
            'throughput_stats': {
                'mean_tokens_per_sec': statistics.mean(tokens_per_sec) if tokens_per_sec else 0,
                'max_tokens_per_sec': max(tokens_per_sec) if tokens_per_sec else 0
            },
            'resource_usage': {
                'avg_memory_mb': statistics.mean(memory_usage) if memory_usage else 0,
                'peak_memory_mb': max(memory_usage) if memory_usage else 0
            },
            'quality_metrics': {
                'avg_quality_score': statistics.mean(quality_scores) if quality_scores else 0,
                'quality_trend': self._calculate_trend(quality_scores) if len(quality_scores) > 5 else 'insufficient_data'
            },
            'error_rate': sum(h['error_rate'] for h in history) / len(history) * 100
        }
        
        return benchmark
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction for a series of values."""
        if len(values) < 2:
            return 'insufficient_data'
        
        # Simple trend calculation using linear regression slope
        x = list(range(len(values)))
        slope = np.polyfit(x, values, 1)[0]
        
        if slope > 0.01:
            return 'improving'
        elif slope < -0.01:
            return 'declining'
        else:
            return 'stable'
    
    def generate_performance_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generate comprehensive performance report."""
        comparison_analytics = self.db.get_comparison_analytics(hours)
        
        # Get all unique models from recent history
        with sqlite3.connect(self.db.db_path) as conn:
            cursor = conn.cursor()
            since = (datetime.now() - timedelta(hours=hours)).isoformat()
            
            cursor.execute("""
                SELECT DISTINCT model_name FROM model_performance 
                WHERE timestamp > ?
            """, (since,))
            
            models = [row[0] for row in cursor.fetchall()]
        
        # Generate benchmarks for each model
        model_benchmarks = {}
        for model in models:
            model_benchmarks[model] = self.get_model_benchmark(model, hours)
        
        # System performance summary
        recent_system_metrics = list(self.system_metrics_history)[-100:]  # Last 100 entries
        
        system_summary = {}
        if recent_system_metrics:
            system_summary = {
                'avg_cpu_usage': statistics.mean(m['cpu_percent'] for m in recent_system_metrics),
                'avg_memory_usage': statistics.mean(m['memory_percent'] for m in recent_system_metrics),
                'peak_cpu_usage': max(m['cpu_percent'] for m in recent_system_metrics),
                'peak_memory_usage': max(m['memory_percent'] for m in recent_system_metrics)
            }
        
        return {
            'report_generated': datetime.now().isoformat(),
            'time_period_hours': hours,
            'comparison_analytics': comparison_analytics,
            'model_benchmarks': model_benchmarks,
            'system_performance': system_summary,
            'active_sessions': len(self.active_sessions),
            'recommendations': self._generate_recommendations(model_benchmarks, system_summary)
        }
    
    def _generate_recommendations(self, model_benchmarks: Dict, system_summary: Dict) -> List[str]:
        """Generate performance recommendations based on metrics."""
        recommendations = []
        
        # Model performance recommendations
        if model_benchmarks:
            fastest_model = min(model_benchmarks.items(), 
                              key=lambda x: x[1].get('response_time_stats', {}).get('mean', float('inf')))
            recommendations.append(f"Fastest model: {fastest_model[0]} with avg response time {fastest_model[1].get('response_time_stats', {}).get('mean', 0):.2f}s")
            
            for model, benchmark in model_benchmarks.items():
                error_rate = benchmark.get('error_rate', 0)
                if error_rate > 5:
                    recommendations.append(f"High error rate ({error_rate:.1f}%) detected for {model}")
        
        # System performance recommendations
        if system_summary:
            if system_summary.get('avg_cpu_usage', 0) > 80:
                recommendations.append("High CPU usage detected - consider scaling resources")
            
            if system_summary.get('avg_memory_usage', 0) > 85:
                recommendations.append("High memory usage detected - monitor for memory leaks")
        
        return recommendations
    
    def export_metrics(self, filepath: str, hours: int = 24) -> bool:
        """Export performance metrics to file."""
        try:
            report = self.generate_performance_report(hours)
            
            with open(filepath, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            logger.info(f"Metrics exported to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error exporting metrics: {e}")
            return False

# Global performance monitor instance
performance_monitor = PerformanceMonitor()

def initialize_monitoring():
    """Initialize performance monitoring system."""
    performance_monitor.start_monitoring()
    logger.info("Performance monitoring system initialized")

def get_performance_report(hours: int = 24) -> Dict[str, Any]:
    """Get performance report for API endpoints."""
    return performance_monitor.generate_performance_report(hours)

if __name__ == "__main__":
    # Example usage and testing
    monitor = PerformanceMonitor()
    monitor.start_monitoring(interval=10)
    
    # Simulate some model sessions
    session1 = monitor.start_model_session("test_session_1", "llama2")
    time.sleep(2)  # Simulate processing time
    monitor.end_model_session("test_session_1", token_count=150, quality_score=0.85)
    
    # Generate report
    report = monitor.generate_performance_report(hours=1)
    print(json.dumps(report, indent=2, default=str))
    
    monitor.stop_monitoring() 