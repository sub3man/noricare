from typing import Dict, List, Any
import json
import os

class PrescriptionEngine:
    """
    Step 3: Prescription Generator using 100+ exercises database.
    Maps user groups to appropriate exercises based on intensity.
    """
    
    # Intensity ranges for each group
    GROUP_INTENSITY_RANGES = {
        "Normal": (5, 9),       # 높은 강도 가능
        "Pre-frail": (3, 6),    # 중간 강도
        "Frail": (1, 4),        # 낮은 강도만
        "Sarcopenic": (4, 7)    # 근력 운동 중심
    }
    
    # Type preferences for each group
    GROUP_TYPE_PREFERENCES = {
        "Normal": {"유산소": 0.4, "무산소": 0.4, "스트레칭": 0.2},
        "Pre-frail": {"스트레칭": 0.4, "무산소": 0.3, "유산소": 0.3},
        "Frail": {"스트레칭": 0.5, "무산소": 0.2, "유산소": 0.3},
        "Sarcopenic": {"무산소": 0.5, "스트레칭": 0.3, "유산소": 0.2}
    }
    
    # Contraindicated exercises by condition
    CONTRAINDICATED = {
        "Hypertension": ["제자리 점프 스쿼트", "마운틴 클라이머 (빠르게)", "플랭크 잭", "하이 니"],
        "Diabetes": [],
        "Arthritis": ["정자세 푸쉬업", "제자리 런지", "사이드 런지", "플랭크 (정자세)"],
        "Osteoporosis": ["제자리 뛰기", "점프 스쿼트", "버피", "스케이터 점프"],
        "Heart Disease": ["슬로우 버피", "마운틴 클라이머", "하이 니", "점프 스쿼트"],
        "Back Pain": ["윗몸 일으키기", "레그 레이즈", "러시안 트위스트", "서서 상체 숙이기"]
    }
    
    def __init__(self):
        """Load exercises from JSON file."""
        self.exercises = self._load_exercises()
    
    def _load_exercises(self) -> List[Dict]:
        """Load exercises from JSON database."""
        exercises_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            '..', 'data', 'exercises.json'
        )
        
        try:
            with open(exercises_path, 'r', encoding='utf-8') as f:
                exercises = json.load(f)
            print(f"[Prescription Engine] Loaded {len(exercises)} exercises from database")
            return exercises
        except FileNotFoundError:
            print("[Prescription Engine] exercises.json not found, using default exercises")
            return self._get_default_exercises()
    
    def _get_default_exercises(self) -> List[Dict]:
        """Fallback default exercises."""
        return [
            {"id": 1, "name": "목 천천히 좌우로 돌리기", "type": "스트레칭", "sets": 2, "reps": "5회", "intensity": 2},
            {"id": 2, "name": "어깨 으쓱하기", "type": "스트레칭", "sets": 3, "reps": "15회", "intensity": 3},
            {"id": 31, "name": "벽 짚고 푸쉬업", "type": "무산소", "sets": 3, "reps": "12회", "intensity": 5},
            {"id": 71, "name": "제자리 걷기", "type": "유산소", "sets": 1, "reps": "5분", "intensity": 3}
        ]
    
    def generate_prescription(
        self, 
        user_group: str, 
        conditions: List[str] = None,
        num_exercises: int = 8
    ) -> List[Dict]:
        """
        Generate personalized exercise prescription based on user group.
        
        Args:
            user_group: Normal, Pre-frail, Frail, or Sarcopenic
            conditions: List of health conditions
            num_exercises: Number of exercises to prescribe (default 8)
        
        Returns:
            List of exercise dictionaries
        """
        conditions = conditions or []
        
        # Get intensity range for group
        min_intensity, max_intensity = self.GROUP_INTENSITY_RANGES.get(
            user_group, (3, 6)
        )
        
        # Filter exercises by intensity
        suitable_exercises = [
            ex for ex in self.exercises 
            if min_intensity <= ex['intensity'] <= max_intensity
        ]
        
        # Apply safety filter (remove contraindicated exercises)
        safe_exercises = self._apply_safety_filter(suitable_exercises, conditions)
        
        # Group by type
        by_type = {"스트레칭": [], "무산소": [], "유산소": []}
        for ex in safe_exercises:
            if ex['type'] in by_type:
                by_type[ex['type']].append(ex)
        
        # Get type preferences for this group
        preferences = self.GROUP_TYPE_PREFERENCES.get(user_group, {
            "스트레칭": 0.33, "무산소": 0.33, "유산소": 0.34
        })
        
        # Build balanced prescription
        prescription = []
        
        for ex_type, ratio in preferences.items():
            count = max(1, int(num_exercises * ratio))
            available = by_type.get(ex_type, [])
            
            # Sort by intensity (prefer middle of range)
            target_intensity = (min_intensity + max_intensity) / 2
            available.sort(key=lambda x: abs(x['intensity'] - target_intensity))
            
            prescription.extend(available[:count])
        
        # Ensure we have enough exercises
        if len(prescription) < num_exercises:
            remaining = [ex for ex in safe_exercises if ex not in prescription]
            prescription.extend(remaining[:num_exercises - len(prescription)])
        
        # Limit to requested number
        prescription = prescription[:num_exercises]
        
        # Add prescription metadata
        for ex in prescription:
            ex['prescribed_for'] = user_group
            ex['safety_checked'] = True
        
        return prescription
    
    def _apply_safety_filter(
        self, 
        exercises: List[Dict], 
        conditions: List[str]
    ) -> List[Dict]:
        """Remove exercises contraindicated for user's conditions."""
        contraindicated_names = set()
        
        for condition in conditions:
            contraindicated_names.update(
                self.CONTRAINDICATED.get(condition, [])
            )
        
        return [
            ex for ex in exercises 
            if not any(contra in ex['name'] for contra in contraindicated_names)
        ]
    
    def get_exercise_by_id(self, exercise_id: int) -> Dict:
        """Get exercise details by ID."""
        for ex in self.exercises:
            if ex['id'] == exercise_id:
                return ex
        return None
    
    def get_exercises_by_type(self, exercise_type: str) -> List[Dict]:
        """Get all exercises of a specific type."""
        return [ex for ex in self.exercises if ex['type'] == exercise_type]
    
    def get_exercises_by_intensity(
        self, 
        min_intensity: int = 1, 
        max_intensity: int = 10
    ) -> List[Dict]:
        """Get exercises within intensity range."""
        return [
            ex for ex in self.exercises 
            if min_intensity <= ex['intensity'] <= max_intensity
        ]
