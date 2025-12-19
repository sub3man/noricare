from typing import Dict, Any
import numpy as np

class OptimizationLoop:
    """
    Step 4: Real-time Optimization Loop (MLP based).
    """
    
    def __init__(self):
        # self.mlp_model = load_model('models/mlp_optimizer.h5')
        pass

    def fine_tune_prescription(self, current_prescription: Dict[str, Any], feedback_log: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adjusts intensity for the NEXT session based on RPE/Pain/Satisfaction.
        
        Args:
            current_prescription: The dict of the exercise just performed.
            feedback_log: { 'rpe': 1-10, 'has_pain': bool, 'satisfaction': 1-5 }
        """
        
        # 1. Extract Feedback Features
        rpe = feedback_log.get('rpe', 5)
        has_pain = feedback_log.get('has_pain', False)
        satisfaction = feedback_log.get('satisfaction', 3)
        current_intensity = current_prescription.get('intensity', 5)
        
        # 2. MLP Inference Simulation
        # Logic: If Pain -> Reduce Intensity sharply
        # Logic: If RPE high (>7) -> Reduce slightly
        # Logic: If RPE low (<4) and Satisfaction high -> Increase
        
        delta = 0
        if has_pain:
            delta = -2
        elif rpe > 7:
            delta = -1
        elif rpe < 4 and satisfaction >= 4:
            delta = +1
            
        # 3. Apply Adjustment
        new_intensity = max(1, min(10, current_intensity + delta))
        
        optimized = current_prescription.copy()
        optimized['intensity'] = new_intensity
        
        # If pain was present, flagged for coach review
        if has_pain:
            optimized['needs_review'] = True
            
        return optimized
