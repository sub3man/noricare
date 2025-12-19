"""
Quick test script for the updated AI engine with trained ML models.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.diagnosis import HybridDiagnosisEngine
from core.clustering import UserClustering
from core.prescription import PrescriptionEngine

def test_ai_engine():
    """Test the AI engine with sample data."""
    print("=" * 60)
    print("  Noricare AI Engine - Integration Test")
    print("=" * 60)
    
    # Initialize engines
    diagnosis_engine = HybridDiagnosisEngine()
    clustering = UserClustering()
    prescription_engine = PrescriptionEngine()
    
    # Sample test cases
    test_cases = [
        {
            "name": "Healthy Senior",
            "profile": {
                "conditions": [],
                "gds_score": 2,
                "eq_vas": 85
            },
            "metrics": {
                "grip_strength": 28.0,
                "gait_speed": 1.2,
                "tug": 10.0,
                "sppb_walk": 3.5,
                "sppb_chair": 14.0,
                "sppb": 10
            }
        },
        {
            "name": "Pre-frail Senior",
            "profile": {
                "conditions": ["Hypertension"],
                "gds_score": 6,
                "eq_vas": 55
            },
            "metrics": {
                "grip_strength": 18.0,
                "gait_speed": 0.8,
                "tug": 16.0,
                "sppb_walk": 5.0,
                "sppb_chair": 19.0,
                "sppb": 7
            }
        },
        {
            "name": "Frail Senior",
            "profile": {
                "conditions": ["Diabetes", "Arthritis"],
                "gds_score": 10,
                "eq_vas": 30
            },
            "metrics": {
                "grip_strength": 8.0,
                "gait_speed": 0.4,
                "tug": 28.0,
                "sppb_walk": 9.0,
                "sppb_chair": 23.0,
                "sppb": 4
            }
        }
    ]
    
    for case in test_cases:
        print(f"\n{'='*60}")
        print(f"Testing: {case['name']}")
        print("="*60)
        
        # 1. Diagnosis
        analysis = diagnosis_engine.analyze_risk_factors(
            case['profile'], 
            case['metrics']
        )
        
        print(f"\n[Diagnosis Results]")
        print(f"  Models used: {analysis['models_used']}")
        print(f"  Functional score: {analysis['functional_score']:.3f}")
        print(f"  Disease risk: {analysis['disease_risk_score']:.3f}")
        print(f"  Fall probability: {analysis['fall_probability']:.3f}")
        print(f"  FRAIL category: {analysis['frail_category']}")
        print(f"  FRAIL probabilities: {analysis['frail_probabilities']}")
        
        # 2. Clustering
        group = clustering.segment_user(analysis)
        details = clustering.get_group_details(group)
        membership = clustering.get_membership_scores(analysis)
        
        print(f"\n[Clustering Results]")
        print(f"  Assigned group: {group}")
        print(f"  Description: {details['description']}")
        print(f"  Exercise intensity: {details['exercise_intensity']}")
        print(f"  Membership scores: {membership}")
        
        # 3. Prescription
        exercises = prescription_engine.generate_prescription(
            group, 
            case['profile'].get('conditions', [])
        )
        
        print(f"\n[Prescription Results]")
        print(f"  Recommended exercises: {len(exercises)}")
        for ex in exercises[:3]:
            print(f"    - {ex['name']} (intensity: {ex.get('intensity', 'N/A')})")
    
    print("\n" + "=" * 60)
    print("  Test Complete!")
    print("=" * 60)


if __name__ == "__main__":
    test_ai_engine()
