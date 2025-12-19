from typing import List, Dict, Any

class PrescriptionEngine:
    """
    Step 3: Custom Prescription Logic & Safety First Layer.
    """
    
    def __init__(self):
        self.contraindications = {
            "Arthritis": ["Deep Squat", "High Impact Jump", "Lunge"],
            "Hypertension": ["Valsalva Maneuver", "Inverted Poses", "Heavy Lifting"],
            "SpinalStenosis": ["Excessive Back Extension", "Cobra Pose"]
        }
        
        # Mapping Groups to Curriculums
        self.curriculum_map = {
            "Frail": {
                "category": "BALANCE",
                "exercises": [
                    {"name": "One Leg Stand", "intensity": 2, "sets": 2, "reps": 10},
                    {"name": "Seated March", "intensity": 2, "sets": 3, "reps": 20}
                ]
            },
            "Sarcopenic": {
                "category": "STRENGTH",
                "exercises": [
                    {"name": "Sit to Stand", "intensity": 4, "sets": 3, "reps": 12},
                    {"name": "Wall Pushup", "intensity": 3, "sets": 3, "reps": 10},
                    {"name": "Elastic Band Row", "intensity": 4, "sets": 3, "reps": 15}
                ]
            },
            "Normal": {
                "category": "AEROBIC",
                "exercises": [
                    {"name": "Brisk Walk", "intensity": 6, "duration_min": 30},
                    {"name": "Squat", "intensity": 6, "sets": 3, "reps": 15}
                ]
            },
            "Pre-frail": {
                "category": "FLEXIBILITY",
                "exercises": [
                    {"name": "Calf Stretch", "intensity": 3, "sets": 2, "reps": 30},
                    {"name": "Tandem Stance", "intensity": 4, "sets": 2, "reps": 15}
                ]
            }
        }

    def generate_prescription(self, user_group: str, conditions: List[str]) -> List[Dict[str, Any]]:
        """
        Generates safe exercise list.
        """
        # 1. Base Plan retrieval
        base_plan = self.curriculum_map.get(user_group, self.curriculum_map["Normal"])
        exercises = base_plan.get("exercises", [])
        
        # 2. Safety Layer Filter (Rule-Base)
        safe_exercises = self._apply_safety_filter(exercises, conditions)
        
        return safe_exercises

    def _apply_safety_filter(self, exercises: List[Dict], conditions: List[str]) -> List[Dict]:
        """
        Removes contraindicated movements.
        """
        forbidden_moves = set()
        for cond in conditions:
            if cond in self.contraindications:
                forbidden_moves.update(self.contraindications[cond])
        
        filtered = []
        for ex in exercises:
            if ex['name'] not in forbidden_moves:
                filtered.append(ex)
            else:
                # Optionally replace with safe alternative
                pass
                
        return filtered
