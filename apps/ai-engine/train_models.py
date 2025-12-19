"""
Noricare AI Engine - Model Training Script
Train FRAIL classification and Fall Risk prediction models
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import os

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'senior_walking_data.csv')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

def load_and_preprocess_data():
    """Load and preprocess the senior walking data."""
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} rows, {len(df.columns)} columns")
    
    # Select numeric features for training
    numeric_features = [
        'Grip_Strength_kg',
        'Gait_Speed_mps', 
        'TUG_Time_s',
        'SPPB_Walk_Time_s',
        'SPPB_Chair_Stand_Time_s',
        'GDS_Score',
        'EQ_VAS_Score',
        'EQ5D_Mobility',
        'EQ5D_Self_Care',
        'EQ5D_Usual_Activities',
        'EQ5D_Pain_Discomfort',
        'EQ5D_Anxiety_Depression'
    ]
    
    # Create feature matrix
    X = df[numeric_features].copy()
    
    # Handle missing values
    X = X.fillna(X.median())
    
    # Create FRAIL category target (0=Normal, 1=Pre-frail, 2=Frail)
    y_frail = df['FRAIL_Score'].apply(lambda x: 
        0 if x == 0 else (1 if x <= 2 else 2)
    )
    
    # Create fall risk target (binary: 0=no falls, 1=has falls)
    y_fall = (df['Falls_Last_Year_Count'] > 0).astype(int)
    
    return X, y_frail, y_fall, numeric_features


def train_frail_classifier(X, y):
    """Train FRAIL classification model using Random Forest."""
    print("\n" + "="*50)
    print("Training FRAIL Classification Model")
    print("="*50)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nAccuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, 
        target_names=['Normal', 'Pre-frail', 'Frail']))
    
    print("\nFeature Importances:")
    for name, importance in sorted(
        zip(X.columns, model.feature_importances_), 
        key=lambda x: x[1], reverse=True
    )[:5]:
        print(f"  {name}: {importance:.4f}")
    
    return model, scaler


def train_fall_risk_model(X, y):
    """Train Fall Risk prediction model using Logistic Regression."""
    print("\n" + "="*50)
    print("Training Fall Risk Prediction Model")
    print("="*50)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Logistic Regression
    model = LogisticRegression(
        max_iter=1000,
        class_weight='balanced',
        random_state=42
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nAccuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred,
        target_names=['No Falls', 'Has Falls']))
    
    return model, scaler


def save_models(frail_model, frail_scaler, fall_model, fall_scaler, feature_names):
    """Save trained models to disk."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Save models
    joblib.dump(frail_model, os.path.join(MODELS_DIR, 'frail_classifier.pkl'))
    joblib.dump(frail_scaler, os.path.join(MODELS_DIR, 'frail_scaler.pkl'))
    joblib.dump(fall_model, os.path.join(MODELS_DIR, 'fall_risk_model.pkl'))
    joblib.dump(fall_scaler, os.path.join(MODELS_DIR, 'fall_scaler.pkl'))
    joblib.dump(feature_names, os.path.join(MODELS_DIR, 'feature_names.pkl'))
    
    print(f"\n[OK] Models saved to {MODELS_DIR}")


def main():
    """Main training pipeline."""
    print("="*60)
    print("  Noricare AI Engine - Model Training")
    print("="*60)
    
    # Load data
    X, y_frail, y_fall, feature_names = load_and_preprocess_data()
    
    print(f"\nTarget Distribution (FRAIL):")
    print(f"  Normal (0): {(y_frail == 0).sum()}")
    print(f"  Pre-frail (1-2): {(y_frail == 1).sum()}")
    print(f"  Frail (3+): {(y_frail == 2).sum()}")
    
    print(f"\nTarget Distribution (Falls):")
    print(f"  No Falls: {(y_fall == 0).sum()}")
    print(f"  Has Falls: {(y_fall == 1).sum()}")
    
    # Train models
    frail_model, frail_scaler = train_frail_classifier(X, y_frail)
    fall_model, fall_scaler = train_fall_risk_model(X, y_fall)
    
    # Save models
    save_models(frail_model, frail_scaler, fall_model, fall_scaler, feature_names)
    
    print("\n" + "="*60)
    print("  Training Complete!")
    print("="*60)


if __name__ == "__main__":
    main()
