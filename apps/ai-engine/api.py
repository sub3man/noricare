from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from core.preprocessing import DataPreprocessor
from core.diagnosis import HybridDiagnosisEngine
from core.clustering import UserClustering
from core.prescription import PrescriptionEngine
from core.feedback import OptimizationLoop

app = FastAPI(title="Nori Care AI Engine", version="1.0.0")

# --- DTO Models ---
class PHRData(BaseModel):
    age: int
    gender: str
    sppb: float
    tug: float
    conditions: List[str] = []
    history: List[float] = []

class FeedbackData(BaseModel):
    prescription_id: str
    rpe: int
    has_pain: bool
    satisfaction: int

class PrescriptionRequest(BaseModel):
    user_id: str
    phr_data: PHRData

# --- Dependency Injection (Mock) ---
preprocessor = DataPreprocessor()
diagnosis_engine = HybridDiagnosisEngine()
clustering = UserClustering()
rx_engine = PrescriptionEngine()
optimizer = OptimizationLoop()

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Nori Care AI"}

@app.post("/diagnose/prescription")
def generate_prescription(req: PrescriptionRequest):
    """
    Main pipeline: Ingestion -> Diagnosis -> Segmentation -> Prescription
    """
    try:
        # 1. Preprocessing
        raw_data = req.phr_data.dict()
        clean_data = preprocessor.normalize(raw_data)
        
        # 2. Diagnosis & Clustering
        analysis = diagnosis_engine.analyze_risk_factors(
            user_profile={"conditions": req.phr_data.conditions, "history": req.phr_data.history}, 
            health_metrics=clean_data
        )
        user_group = clustering.segment_user(analysis)
        
        # 3. Prescription
        exercises = rx_engine.generate_prescription(user_group, req.phr_data.conditions)
        
        return {
            "user_id": req.user_id,
            "group": user_group,
            "analysis": analysis,
            "prescription": exercises
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize/feedback")
def optimize_routine(current_prescription: Dict[str, Any], feedback: FeedbackData):
    """
    Optimization Loop: Adjusts intensity based on feedback
    """
    try:
        new_rx = optimizer.fine_tune_prescription(current_prescription, feedback.dict())
        return new_rx
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
