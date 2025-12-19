from typing import Dict, List, Any

class UserClustering:
    """
    Step 2 (Continued): User Segmentation using Fuzzy C-Means.
    """
    
    GROUPS = ["Frail", "Sarcopenic", "Normal", "Pre-frail"]
    
    def segment_user(self, analysis_result: Dict[str, float]) -> str:
        """
        Classifies user into one of the defined groups based on risk scores.
        Real implementation uses Soft Clustering (Membership degrees).
        """
        
        # Features from Diagnosis Step
        d_score = analysis_result.get('disease_risk_score', 0)
        f_score = analysis_result.get('functional_score', 0)
        
        # Heuristic Logic approximating Fuzzy C-Means centroids
        # High Disease Risk + Low Function -> Frail
        # Low Disease Risk + Low Function -> Sarcopenic (Muscle focus)
        # High Function -> Normal
        
        if f_score > 0.8:
            return "Normal"
        elif f_score < 0.4 and d_score > 0.5:
            return "Frail"
        elif f_score < 0.5:
            return "Sarcopenic"
        else:
            return "Pre-frail"
