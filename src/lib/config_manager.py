"""
Configuration Management System for LLM Comparer

This module provides centralized configuration management for models,
analysis settings, and user preferences.
"""

import json
import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Configuration for individual models."""
    name: str
    endpoint: str = "http://localhost:11434"
    timeout: int = 60
    max_tokens: int = 2048
    temperature: float = 0.7
    enabled: bool = True
    display_name: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class AnalysisConfig:
    """Configuration for analysis settings."""
    enable_advanced_analysis: bool = True
    similarity_threshold: float = 0.7
    max_key_phrases: int = 10
    topic_modeling_topics: int = 5
    cache_results: bool = True
    export_format: str = "json"  # json, csv, excel
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class UIConfig:
    """Configuration for UI preferences."""
    theme: str = "light"  # light, dark, auto
    default_comparison_mode: str = "single"  # single, conversation
    auto_save_conversations: bool = True
    show_performance_metrics: bool = False
    animations_enabled: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class ConfigManager:
    """Manages application configuration with file persistence."""
    
    def __init__(self, config_file: str = "llm_comparer_config.json"):
        self.config_file = config_file
        self.config_path = Path(config_file)
        
        # Default configurations
        self.default_models = {
            "llama2": ModelConfig(
                name="llama2",
                display_name="Llama 2",
                endpoint="http://localhost:11434",
                timeout=60
            ),
            "mistral": ModelConfig(
                name="mistral", 
                display_name="Mistral",
                endpoint="http://localhost:11434",
                timeout=45
            ),
            "codellama": ModelConfig(
                name="codellama",
                display_name="Code Llama", 
                endpoint="http://localhost:11434",
                timeout=90
            )
        }
        
        self.default_analysis = AnalysisConfig()
        self.default_ui = UIConfig()
        
        self.load_config()
    
    def load_config(self) -> None:
        """Load configuration from file or create default."""
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    data = json.load(f)
                
                # Load model configurations
                self.models = {}
                for name, config_data in data.get('models', {}).items():
                    self.models[name] = ModelConfig(**config_data)
                
                # Fill in any missing default models
                for name, default_model in self.default_models.items():
                    if name not in self.models:
                        self.models[name] = default_model
                
                # Load analysis configuration
                analysis_data = data.get('analysis', {})
                self.analysis = AnalysisConfig(**analysis_data)
                
                # Load UI configuration  
                ui_data = data.get('ui', {})
                self.ui = UIConfig(**ui_data)
                
                logger.info(f"Configuration loaded from {self.config_file}")
                
            except Exception as e:
                logger.error(f"Error loading config: {e}")
                self._create_default_config()
        else:
            self._create_default_config()
    
    def _create_default_config(self) -> None:
        """Create default configuration."""
        self.models = self.default_models.copy()
        self.analysis = self.default_analysis
        self.ui = self.default_ui
        self.save_config()
        logger.info("Created default configuration")
    
    def save_config(self) -> bool:
        """Save current configuration to file."""
        try:
            config_data = {
                'models': {name: model.to_dict() for name, model in self.models.items()},
                'analysis': self.analysis.to_dict(),
                'ui': self.ui.to_dict(),
                'version': '1.0',
                'last_updated': str(Path(__file__).stat().st_mtime)
            }
            
            with open(self.config_path, 'w') as f:
                json.dump(config_data, f, indent=2)
            
            logger.info(f"Configuration saved to {self.config_file}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving config: {e}")
            return False
    
    def get_model_config(self, model_name: str) -> Optional[ModelConfig]:
        """Get configuration for a specific model."""
        return self.models.get(model_name)
    
    def add_model(self, model_config: ModelConfig) -> None:
        """Add or update a model configuration."""
        self.models[model_config.name] = model_config
        self.save_config()
    
    def remove_model(self, model_name: str) -> bool:
        """Remove a model configuration."""
        if model_name in self.models:
            del self.models[model_name]
            self.save_config()
            return True
        return False
    
    def get_enabled_models(self) -> List[ModelConfig]:
        """Get list of enabled models."""
        return [model for model in self.models.values() if model.enabled]
    
    def update_analysis_config(self, **kwargs) -> None:
        """Update analysis configuration."""
        for key, value in kwargs.items():
            if hasattr(self.analysis, key):
                setattr(self.analysis, key, value)
        self.save_config()
    
    def update_ui_config(self, **kwargs) -> None:
        """Update UI configuration."""
        for key, value in kwargs.items():
            if hasattr(self.ui, key):
                setattr(self.ui, key, value)
        self.save_config()
    
    def get_config_summary(self) -> Dict[str, Any]:
        """Get a summary of current configuration."""
        return {
            'total_models': len(self.models),
            'enabled_models': len(self.get_enabled_models()),
            'model_list': [model.display_name or model.name for model in self.models.values()],
            'analysis_settings': self.analysis.to_dict(),
            'ui_settings': self.ui.to_dict()
        }
    
    def validate_config(self) -> List[str]:
        """Validate configuration and return any issues."""
        issues = []
        
        # Check if we have at least 2 enabled models
        enabled_models = self.get_enabled_models()
        if len(enabled_models) < 2:
            issues.append("At least 2 models must be enabled for comparisons")
        
        # Validate model endpoints
        for model in enabled_models:
            if not model.endpoint.startswith(('http://', 'https://')):
                issues.append(f"Invalid endpoint for model {model.name}: {model.endpoint}")
        
        # Validate analysis settings
        if self.analysis.similarity_threshold < 0 or self.analysis.similarity_threshold > 1:
            issues.append("Similarity threshold must be between 0 and 1")
        
        if self.analysis.topic_modeling_topics < 2:
            issues.append("Topic modeling requires at least 2 topics")
        
        return issues
    
    def reset_to_defaults(self) -> None:
        """Reset configuration to defaults."""
        self.models = self.default_models.copy()
        self.analysis = self.default_analysis
        self.ui = self.default_ui
        self.save_config()
        logger.info("Configuration reset to defaults")
    
    def export_config(self, filepath: str) -> bool:
        """Export configuration to a file."""
        try:
            config_data = {
                'models': {name: model.to_dict() for name, model in self.models.items()},
                'analysis': self.analysis.to_dict(),
                'ui': self.ui.to_dict(),
                'exported_at': str(Path(__file__).stat().st_mtime)
            }
            
            with open(filepath, 'w') as f:
                json.dump(config_data, f, indent=2)
            
            logger.info(f"Configuration exported to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error exporting config: {e}")
            return False
    
    def import_config(self, filepath: str) -> bool:
        """Import configuration from a file."""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Backup current config
            backup_file = f"{self.config_file}.backup"
            self.export_config(backup_file)
            
            # Import new config
            if 'models' in data:
                self.models = {}
                for name, config_data in data['models'].items():
                    self.models[name] = ModelConfig(**config_data)
            
            if 'analysis' in data:
                self.analysis = AnalysisConfig(**data['analysis'])
            
            if 'ui' in data:
                self.ui = UIConfig(**data['ui'])
            
            self.save_config()
            logger.info(f"Configuration imported from {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error importing config: {e}")
            return False

# Global configuration manager instance
config_manager = ConfigManager()

def get_config() -> ConfigManager:
    """Get the global configuration manager."""
    return config_manager

def get_model_config(model_name: str) -> Optional[ModelConfig]:
    """Get configuration for a specific model."""
    return config_manager.get_model_config(model_name)

def get_enabled_models() -> List[str]:
    """Get list of enabled model names."""
    return [model.name for model in config_manager.get_enabled_models()]

if __name__ == "__main__":
    # Example usage
    cm = ConfigManager()
    
    # Add a custom model
    custom_model = ModelConfig(
        name="custom_llama",
        display_name="Custom Llama",
        endpoint="http://custom-server:11434",
        temperature=0.8
    )
    cm.add_model(custom_model)
    
    # Update analysis settings
    cm.update_analysis_config(
        similarity_threshold=0.8,
        max_key_phrases=15
    )
    
    # Print configuration summary
    summary = cm.get_config_summary()
    print(json.dumps(summary, indent=2))
    
    # Validate configuration
    issues = cm.validate_config()
    if issues:
        print("Configuration issues found:")
        for issue in issues:
            print(f"- {issue}")
    else:
        print("Configuration is valid!") 