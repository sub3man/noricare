from typing import Dict, Any, List
import os
import joblib
import numpy as np

class HybridDiagnosisEngine:
    """
    Step 2: Diagnosis & Clustering Engine using Trained ML Models.
    Uses RandomForest for FRAIL classification and LogisticRegression for fall risk.
    """
    
    def __init__(self):
        """Load trained models from disk."""
        # Models are in ai-engine/models, not core/models
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        
        # Try to load trained models
        try:
            self.frail_model = joblib.load(os.path.join(models_dir, 'frail_classifier.pkl'))
            self.frail_scaler = joblib.load(os.path.join(models_dir, 'frail_scaler.pkl'))
            self.fall_model = joblib.load(os.path.join(models_dir, 'fall_risk_model.pkl'))
            self.fall_scaler = joblib.load(os.path.join(models_dir, 'fall_scaler.pkl'))
            self.feature_names = joblib.load(os.path.join(models_dir, 'feature_names.pkl'))
            self.models_loaded = True
            print("[AI Engine] Trained models loaded successfully")
        except FileNotFoundError:
            print("[AI Engine] Models not found, using fallback heuristics")
            self.models_loaded = False
            self.feature_names = [
                'Grip_Strength_kg', 'Gait_Speed_mps', 'TUG_Time_s',
                'SPPB_Walk_Time_s', 'SPPB_Chair_Stand_Time_s',
                'GDS_Score', 'EQ_VAS_Score', 'EQ5D_Mobility',
                'EQ5D_Self_Care', 'EQ5D_Usual_Activities',
                'EQ5D_Pain_Discomfort', 'EQ5D_Anxiety_Depression'
            ]

    def prepare_features(self, user_profile: Dict, health_metrics: Dict) -> np.ndarray:
        """Convert user input to feature vector matching training data format."""
        features = []
        
        # Map input data to feature vector
        feature_mapping = {
            'Grip_Strength_kg': health_metrics.get('grip_strength', 20.0),
            'Gait_Speed_mps': health_metrics.get('gait_speed', 0.8),
            'TUG_Time_s': health_metrics.get('tug', 15.0),
            'SPPB_Walk_Time_s': health_metrics.get('sppb_walk', 5.0),
            'SPPB_Chair_Stand_Time_s': health_metrics.get('sppb_chair', 18.0),
            'GDS_Score': user_profile.get('gds_score', 5),
            'EQ_VAS_Score': user_profile.get('eq_vas', 60),
            'EQ5D_Mobility': user_profile.get('eq5d_mobility', 2),
            'EQ5D_Self_Care': user_profile.get('eq5d_selfcare', 2),
            'EQ5D_Usual_Activities': user_profile.get('eq5d_activities', 2),
            'EQ5D_Pain_Discomfort': user_profile.get('eq5d_pain', 3),
            'EQ5D_Anxiety_Depression': user_profile.get('eq5d_anxiety', 2)
        }
        
        for name in self.feature_names:
            features.append(feature_mapping.get(name, 0))
        
        return np.array(features).reshape(1, -1)

    def analyze_risk_factors(self, user_profile: Dict, health_metrics: Dict) -> Dict[str, Any]:
        """
        Analyze risk factors using trained ML models.
        Returns risk scores and predictions.
        """
        # Prepare feature vector
        features = self.prepare_features(user_profile, health_metrics)
        
        if self.models_loaded:
            # Use trained models
            features_scaled_frail = self.frail_scaler.transform(features)
            features_scaled_fall = self.fall_scaler.transform(features)
            
            # FRAIL prediction (0=Normal, 1=Pre-frail, 2=Frail)
            frail_pred = int(self.frail_model.predict(features_scaled_frail)[0])
            frail_proba = self.frail_model.predict_proba(features_scaled_frail)[0]
            
            # Fall risk prediction
            fall_pred = int(self.fall_model.predict(features_scaled_fall)[0])
            fall_proba = self.fall_model.predict_proba(features_scaled_fall)[0]
            
            # Calculate functional score (inverse of frailty level)
            functional_score = 1.0 - (frail_pred / 2.0)
            
            # Disease risk based on fall prediction probability
            disease_risk = float(fall_proba[1])
            
        else:
            # Fallback to heuristic calculation
            disease_risk = self._predict_logistic_risk(user_profile.get('conditions', []))
            functional_score = self._predict_rf_capacity(health_metrics)
            frail_pred = 1 if functional_score < 0.5 else 0
            frail_proba = [0.0, 1.0, 0.0] if functional_score < 0.5 else [1.0, 0.0, 0.0]
            fall_pred = 1 if disease_risk > 0.5 else 0
            fall_proba = [1.0 - disease_risk, disease_risk]
        
        # Calculate trend from history
        trend_score = self._predict_arima_trend(user_profile.get('history', []))
        
        return {
            "disease_risk_score": disease_risk,
            "functional_score": functional_score,
            "trend_score": trend_score,
            "frail_category": frail_pred,
            "frail_probabilities": {
                "Normal": float(frail_proba[0]),
                "Pre-frail": float(frail_proba[1]),
                "Frail": float(frail_proba[2])
            },
            "fall_risk": fall_pred,
            "fall_probability": float(fall_proba[1]) if len(fall_proba) > 1 else 0.0,
            "models_used": "trained_ml" if self.models_loaded else "heuristic"
        }

    def _predict_logistic_risk(self, conditions: List[str]) -> float:
        """Fallback: Simulates Logistic Regression output for disease risk."""
        risk = 0.0
        weights = {"Hypertension": 0.3, "Diabetes": 0.4, "Arthritis": 0.2}
        for cond in conditions:
            risk += weights.get(cond, 0.1)
        return min(1.0, risk)

    def _predict_rf_capacity(self, metrics: Dict) -> float:
        """Fallback: Simulates Random Forest output for functional capacity."""
        sppb = metrics.get('sppb', 0)
        tug = metrics.get('tug', 30)
        score = (sppb / 12.0) * 0.6 + (max(0, 30 - tug) / 30.0) * 0.4
        return score

    def _predict_arima_trend(self, history: List[float]) -> float:
        """Analyze trend from historical data."""
        if not history:
            return 0.5
        # Return simple average of last 3 points
        return sum(history[-3:]) / len(history[-3:])
