from typing import Dict, Any
import numpy as np

class DataPreprocessor:
    """
    Step 1: Data Ingestion & Preprocessing
    Handles missing values and normalization for PHR data.
    """
    
    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for preprocessing.
        
        Args:
            raw_data: Dictionary containing 'sppb', 'tug', 'age', etc.
            
        Returns:
            Cleaned and normalized dictionary.
        """
        # 1. Imputation (Handle missing values)
        cleaned = self._impute_missing(raw_data)
        
        # 2. Normalization (Min-Max scaling for specific fields)
        # SPPB is 0-12
        if 'sppb' in cleaned and cleaned['sppb'] is not None:
            cleaned['normalized_sppb'] = self._min_max_scale(cleaned['sppb'], 0, 12)
            
        # Age normalization (assuming range 60-100 for ecosystem)
        if 'age' in cleaned and cleaned['age'] is not None:
            cleaned['normalized_age'] = self._min_max_scale(cleaned['age'], 60, 100)
            
        return cleaned

    def _impute_missing(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simple mean/mode imputation logic.
        In production, this would use a learned imputer (e.g. KNNImputer).
        """
        # Example: Set default SPPB if missing
        if 'sppb' not in data or data['sppb'] is None:
            data['sppb'] = 0.0 # Default conservative score
            
        if 'tug' not in data or data['tug'] is None:
            data['tug'] = 30.0 # Slow default (seconds)
            
        return data

    def _min_max_scale(self, value: float, min_val: float, max_val: float) -> float:
        """Scales value to 0-1 range."""
        return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))
