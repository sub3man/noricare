from typing import Dict, List, Any
import os
import joblib
import numpy as np

class UserClustering:
    """
    Step 2 (Continued): User Segmentation using trained FRAIL classifier.
    Maps ML predictions to user groups.
    """
    
    GROUPS = ["Normal", "Pre-frail", "Frail", "Sarcopenic"]
    
    GROUP_MAPPING = {
        0: "Normal",      # FRAIL score 0
        1: "Pre-frail",   # FRAIL score 1-2
        2: "Frail"        # FRAIL score 3+
    }
    
    def __init__(self):
        """Initialize with trained model reference."""
        # Models are in ai-engine/models, not core/models
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        
        try:
            self.frail_model = joblib.load(os.path.join(models_dir, 'frail_classifier.pkl'))
            self.frail_scaler = joblib.load(os.path.join(models_dir, 'frail_scaler.pkl'))
            self.models_loaded = True
        except FileNotFoundError:
            self.models_loaded = False
    
    def segment_user(self, analysis_result: Dict[str, Any]) -> str:
        """
        Classifies user into one of the defined groups based on ML analysis.
        Uses the frail_category from diagnosis or calculates from scores.
        """
        
        # If we have ML prediction from diagnosis
        if 'frail_category' in analysis_result:
            category = analysis_result['frail_category']
            base_group = self.GROUP_MAPPING.get(category, "Pre-frail")
            
            # Check for Sarcopenic condition
            # Low functional score but low disease risk suggests muscle-focused issue
            f_score = analysis_result.get('functional_score', 0.5)
            d_score = analysis_result.get('disease_risk_score', 0.5)
            
            if f_score < 0.5 and d_score < 0.3 and base_group != "Frail":
                return "Sarcopenic"
            
            return base_group
        
        # Fallback: Use heuristic logic
        d_score = analysis_result.get('disease_risk_score', 0)
        f_score = analysis_result.get('functional_score', 0)
        
        if f_score > 0.8:
            return "Normal"
        elif f_score < 0.4 and d_score > 0.5:
            return "Frail"
        elif f_score < 0.5:
            return "Sarcopenic"
        else:
            return "Pre-frail"
    
    def get_group_details(self, group: str) -> Dict[str, Any]:
        """Get detailed information about a user group."""
        details = {
            "Normal": {
                "description": "Good physical function with low disease risk",
                "exercise_intensity": "moderate-high",
                "focus_areas": ["aerobic", "strength_maintenance"],
                "recommended_frequency": "4-5 times/week"
            },
            "Pre-frail": {
                "description": "Early signs of decline, preventive focus needed",
                "exercise_intensity": "low-moderate",
                "focus_areas": ["flexibility", "balance", "light_strength"],
                "recommended_frequency": "3-4 times/week"
            },
            "Frail": {
                "description": "High frailty risk, requires careful supervised exercise",
                "exercise_intensity": "very_low",
                "focus_areas": ["balance", "gentle_mobility", "fall_prevention"],
                "recommended_frequency": "2-3 times/week"
            },
            "Sarcopenic": {
                "description": "Muscle loss focus, needs progressive resistance training",
                "exercise_intensity": "low-moderate",
                "focus_areas": ["resistance_training", "protein_nutrition"],
                "recommended_frequency": "3-4 times/week"
            }
        }
        return details.get(group, details["Pre-frail"])
    
    def get_membership_scores(self, analysis_result: Dict[str, Any]) -> Dict[str, float]:
        """
        Get soft clustering membership scores for each group.
        Uses ML probability outputs when available.
        """
        if 'frail_probabilities' in analysis_result:
            probs = analysis_result['frail_probabilities']
            
            # Calculate sarcopenic probability based on conditions
            f_score = analysis_result.get('functional_score', 0.5)
            d_score = analysis_result.get('disease_risk_score', 0.5)
            sarco_prob = max(0, (1 - f_score) * (1 - d_score) * 0.5)
            
            # Normalize probabilities
            total = probs['Normal'] + probs['Pre-frail'] + probs['Frail'] + sarco_prob
            
            return {
                "Normal": probs['Normal'] / total,
                "Pre-frail": probs['Pre-frail'] / total,
                "Frail": probs['Frail'] / total,
                "Sarcopenic": sarco_prob / total
            }
        
        # Fallback: Simple heuristic
        d_score = analysis_result.get('disease_risk_score', 0.5)
        f_score = analysis_result.get('functional_score', 0.5)
        
        return {
            "Normal": f_score * (1 - d_score),
            "Pre-frail": 0.5,
            "Frail": (1 - f_score) * d_score,
            "Sarcopenic": (1 - f_score) * (1 - d_score)
        }
