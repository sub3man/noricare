// API Configuration and Types

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface PHRData {
    age: number;
    gender: string;
    sppb: number;
    tug: number;
    conditions: string[];
    history: number[];
}

export interface PrescriptionRequest {
    user_id: string;
    phr_data: PHRData;
}

export interface DiagnosisResult {
    user_id: string;
    group: string;
    analysis: {
        risk_level: string;
        frailty_score: number;
        mobility_score: number;
        trend: string;
    };
    prescription: Exercise[];
}

export interface Exercise {
    id: string;
    category: string;
    name: string;
    intensity: number;
    sets: number;
    reps: number;
    duration?: number;
    video_url?: string;
    is_contraindicated: boolean;
}

export interface FeedbackData {
    prescription_id: string;
    rpe: number;
    has_pain: boolean;
    satisfaction: number;
}

// API Error Handler
class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            errorData.detail || `HTTP error! status: ${response.status}`
        );
    }
    return response.json();
}

// API Functions

/**
 * Health Check - Verify API is running
 */
export async function healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${API_BASE_URL}/`);
    return handleResponse(response);
}

/**
 * Generate Prescription - Main AI pipeline
 * @param request - PHR data and user ID
 * @returns Diagnosis result with exercise prescription
 */
export async function generatePrescription(
    request: PrescriptionRequest
): Promise<DiagnosisResult> {
    const response = await fetch(`${API_BASE_URL}/diagnose/prescription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
    return handleResponse(response);
}

/**
 * Submit Feedback - Optimize routine based on user feedback
 * @param currentPrescription - Current exercise prescription
 * @param feedback - User feedback data
 * @returns Optimized prescription
 */
export async function submitFeedback(
    currentPrescription: Record<string, unknown>,
    feedback: FeedbackData
): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/optimize/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            current_prescription: currentPrescription,
            feedback,
        }),
    });
    return handleResponse(response);
}

// Utility functions for local storage (for demo/offline mode)

const STORAGE_KEYS = {
    USER_PROFILE: 'noricare_user_profile',
    PRESCRIPTIONS: 'noricare_prescriptions',
    FEEDBACK_HISTORY: 'noricare_feedback_history',
};

export function saveToLocalStorage<T>(key: string, data: T): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

export function loadFromLocalStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

export function clearLocalStorage(): void {
    if (typeof window !== 'undefined') {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

export { STORAGE_KEYS, ApiError };
