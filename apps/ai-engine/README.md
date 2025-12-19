# Nori Care AI Engine

This service handles the core logic for the Nori Care platform, including:
1.  **PHR Data Preprocessing**
2.  **Hybrid Diagnosis** (Logistic/RF/ARIMA)
3.  **User Segmentation** (Fuzzy logic)
4.  **Prescription Generation** (Safety filtered)
5.  **Feedback Optimization Loop** (MLP)

## Setup

1.  Navigate to `apps/ai-engine`
2.  Create virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # UNIX
    # or
    venv\Scripts\activate     # Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

```bash
uvicorn api:app --reload --port 8000
```

## Endpoints

*   `POST /diagnose/prescription`: Generates initial routine based on PHR.
*   `POST /optimize/feedback`: Adjusts routine based on user feedback.
