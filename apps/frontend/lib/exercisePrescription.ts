// Exercise Prescription Engine - ACSM/AHA Evidence-Based Guidelines
// Reference: ACSM Guidelines 2024, AHA Physical Activity Recommendations

// ===== Types =====

export interface AssessmentData {
    age: number;
    gender: 'M' | 'F';
    frailScore: number;      // 0-5 (FRAIL scale)
    sppbScore: number;       // 0-12 (Short Physical Performance Battery)
    sarcfScore: number;      // 0-10 (SARC-F)
    conditions: string[];    // 만성질환 목록
    hasFallHistory: boolean; // 최근 1년 낙상력
}

export interface ExercisePrescription {
    riskCategory: 'normal' | 'prefrail' | 'frail';
    aerobic: AerobicPrescription;
    resistance: ResistancePrescription;
    balance: BalancePrescription | null;
    flexibility: FlexibilityPrescription;
    precautions: string[];
    weeklyPlan: WeeklyPlan;
}

export interface AerobicPrescription {
    minutesPerWeek: number;
    frequency: number;        // days per week
    intensity: 'low' | 'moderate' | 'vigorous';
    rpeRange: [number, number];  // RPE scale 0-10
    examples: string[];
}

export interface ResistancePrescription {
    daysPerWeek: number;
    exercises: ExerciseDetail[];
    intensityPercent: [number, number]; // %1RM range
    rpeRange: [number, number];
    sets: number;
    reps: [number, number];
}

export interface BalancePrescription {
    daysPerWeek: number;
    exercises: ExerciseDetail[];
    duration: number; // minutes per session
}

export interface FlexibilityPrescription {
    daysPerWeek: number;
    holdSeconds: number;
    exercises: ExerciseDetail[];
}

export interface ExerciseDetail {
    id: string;
    name: string;
    category: string;
    description: string;
    videoUrl?: string;
    isContraindicated?: boolean;
    contraindications?: string[];
}

export interface WeeklyPlan {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
    saturday: DayPlan;
    sunday: DayPlan;
}

export interface DayPlan {
    type: 'rest' | 'aerobic' | 'resistance' | 'combined';
    exercises: string[];
    duration: number;
}

// ===== Exercise Database =====

const AEROBIC_EXERCISES: ExerciseDetail[] = [
    { id: 'walk', name: '걷기', category: 'aerobic', description: '편안한 속도로 걷기' },
    { id: 'brisk_walk', name: '빠르게 걷기', category: 'aerobic', description: '대화가 약간 어려운 정도의 속도' },
    { id: 'cycling', name: '실내 자전거', category: 'aerobic', description: '저충격 유산소 운동' },
    { id: 'swimming', name: '수영/수중 걷기', category: 'aerobic', description: '관절 부담 최소화' },
    { id: 'dance', name: '율동 체조', category: 'aerobic', description: '음악에 맞춰 가벼운 동작' },
];

const RESISTANCE_EXERCISES: ExerciseDetail[] = [
    // 상체
    { id: 'wall_pushup', name: '벽 짚고 팔굽혀펴기', category: 'upper', description: '벽에서 한 팔 거리에 서서 실시', contraindications: ['shoulder_pain'] },
    { id: 'seated_row', name: '앉아서 노젓기', category: 'upper', description: '탄력밴드를 이용한 등 운동' },
    { id: 'bicep_curl', name: '아령 들기', category: 'upper', description: '가벼운 아령으로 팔 굽히기' },
    { id: 'shoulder_press', name: '어깨 들어올리기', category: 'upper', description: '머리 위로 팔 들기', contraindications: ['shoulder_pain', 'hypertension'] },

    // 하체
    { id: 'sit_to_stand', name: '앉았다 일어서기', category: 'lower', description: '의자에서 일어났다 앉기 반복' },
    { id: 'leg_extension', name: '앉아서 다리 펴기', category: 'lower', description: '의자에 앉아 무릎 펴기' },
    { id: 'calf_raise', name: '까치발 들기', category: 'lower', description: '벽 잡고 발뒤꿈치 들기' },
    { id: 'squat', name: '스쿼트', category: 'lower', description: '의자 뒤 잡고 앉았다 일어서기', contraindications: ['knee_pain', 'hip_pain'] },
    { id: 'hip_extension', name: '다리 뒤로 들기', category: 'lower', description: '벽 잡고 다리를 뒤로' },

    // 코어
    { id: 'abdominal_bracing', name: '배 힘주기', category: 'core', description: '누워서 배에 힘주고 버티기' },
    { id: 'bird_dog', name: '네발 기기 자세 균형', category: 'core', description: '팔다리 번갈아 들기', contraindications: ['back_pain'] },
];

const BALANCE_EXERCISES: ExerciseDetail[] = [
    { id: 'tandem_stand', name: '발 앞뒤로 서기', category: 'balance', description: '한 발 앞에 다른 발 붙여 10초 버티기' },
    { id: 'single_leg', name: '한 발 서기', category: 'balance', description: '벽 잡고 한 발로 10초 버티기' },
    { id: 'heel_toe_walk', name: '발뒤꿈치-발끝 걷기', category: 'balance', description: '일직선으로 걷기' },
    { id: 'weight_shift', name: '체중 이동', category: 'balance', description: '좌우로 체중 옮기기' },
    { id: 'marching', name: '제자리 걷기', category: 'balance', description: '무릎 높이 들며 제자리 걷기' },
];

const FLEXIBILITY_EXERCISES: ExerciseDetail[] = [
    { id: 'neck_stretch', name: '목 스트레칭', category: 'flexibility', description: '좌우로 목 기울이기' },
    { id: 'shoulder_stretch', name: '어깨 스트레칭', category: 'flexibility', description: '팔 교차하여 당기기' },
    { id: 'hamstring_stretch', name: '허벅지 뒤 스트레칭', category: 'flexibility', description: '앉아서 발끝 잡기' },
    { id: 'calf_stretch', name: '종아리 스트레칭', category: 'flexibility', description: '벽 밀며 종아리 늘리기' },
    { id: 'hip_flexor', name: '고관절 스트레칭', category: 'flexibility', description: '런지 자세로 고관절 늘리기' },
];

// ===== Prescription Logic =====

/**
 * ACSM Risk Stratification based on SPPB and FRAIL scores
 */
export function classifyRiskCategory(data: AssessmentData): 'normal' | 'prefrail' | 'frail' {
    // Primary: SPPB score (ACSM validated)
    if (data.sppbScore >= 10 && data.frailScore <= 1) {
        return 'normal';
    } else if (data.sppbScore >= 7 && data.frailScore <= 3) {
        return 'prefrail';
    } else {
        return 'frail';
    }
}

/**
 * Generate aerobic prescription based on ACSM/AHA guidelines
 * - Normal: 150 min/week moderate or 75 min/week vigorous
 * - Prefrail: 90-120 min/week low-moderate
 * - Frail: 60-90 min/week low, in 10-min bouts
 */
function generateAerobicPrescription(category: 'normal' | 'prefrail' | 'frail', conditions: string[]): AerobicPrescription {
    const hasJointIssue = conditions.some(c => ['knee_pain', 'hip_pain', 'arthritis'].includes(c));

    const baseExamples = hasJointIssue
        ? ['수영/수중 걷기', '실내 자전거', '앉아서 팔 흔들기']
        : ['걷기', '빠르게 걷기', '실내 자전거', '율동 체조'];

    switch (category) {
        case 'normal':
            return {
                minutesPerWeek: 150,
                frequency: 5,
                intensity: 'moderate',
                rpeRange: [5, 6],
                examples: baseExamples,
            };
        case 'prefrail':
            return {
                minutesPerWeek: 100,
                frequency: 4,
                intensity: 'low',
                rpeRange: [3, 5],
                examples: baseExamples,
            };
        case 'frail':
            return {
                minutesPerWeek: 60,
                frequency: 3,
                intensity: 'low',
                rpeRange: [2, 4],
                examples: ['천천히 걷기', '앉아서 팔 흔들기', '가벼운 스트레칭'],
            };
    }
}

/**
 * Generate resistance prescription based on ACSM guidelines
 * - 2 days/week non-consecutive
 * - 8-10 exercises covering major muscle groups
 * - 8-12 reps per set
 */
function generateResistancePrescription(category: 'normal' | 'prefrail' | 'frail', conditions: string[]): ResistancePrescription {
    // Filter exercises based on contraindications
    const safeExercises = RESISTANCE_EXERCISES.filter(ex => {
        if (!ex.contraindications) return true;
        return !ex.contraindications.some(c => conditions.includes(c));
    });

    // Select balanced exercises (upper, lower, core)
    const upperExercises = safeExercises.filter(e => e.category === 'upper').slice(0, 3);
    const lowerExercises = safeExercises.filter(e => e.category === 'lower').slice(0, 3);
    const coreExercises = safeExercises.filter(e => e.category === 'core').slice(0, 2);

    const selectedExercises = [...upperExercises, ...lowerExercises, ...coreExercises];

    switch (category) {
        case 'normal':
            return {
                daysPerWeek: 2,
                exercises: selectedExercises,
                intensityPercent: [60, 80],
                rpeRange: [6, 8],
                sets: 2,
                reps: [10, 12],
            };
        case 'prefrail':
            return {
                daysPerWeek: 2,
                exercises: selectedExercises,
                intensityPercent: [40, 60],
                rpeRange: [4, 6],
                sets: 2,
                reps: [8, 12],
            };
        case 'frail':
            return {
                daysPerWeek: 2,
                exercises: selectedExercises.slice(0, 6), // Fewer exercises
                intensityPercent: [30, 50],
                rpeRange: [3, 5],
                sets: 1,
                reps: [8, 10],
            };
    }
}

/**
 * Generate balance prescription (required if SPPB ≤ 9 or fall history)
 * ACSM: 3x/week for those at fall risk
 */
function generateBalancePrescription(data: AssessmentData): BalancePrescription | null {
    if (data.sppbScore > 9 && !data.hasFallHistory) {
        return null; // Not required
    }

    return {
        daysPerWeek: 3,
        exercises: BALANCE_EXERCISES,
        duration: 15,
    };
}

/**
 * Generate flexibility prescription (ACSM: 2+ days/week)
 */
function generateFlexibilityPrescription(): FlexibilityPrescription {
    return {
        daysPerWeek: 2,
        holdSeconds: 30,
        exercises: FLEXIBILITY_EXERCISES,
    };
}

/**
 * Generate precautions based on conditions
 */
function generatePrecautions(conditions: string[], category: 'normal' | 'prefrail' | 'frail'): string[] {
    const precautions: string[] = [];

    if (conditions.includes('hypertension')) {
        precautions.push('고강도 저항운동 시 발살바 호흡법 피하기');
        precautions.push('운동 전후 혈압 체크 권장');
    }
    if (conditions.includes('diabetes')) {
        precautions.push('운동 전 혈당 확인 (100-250 mg/dL 권장)');
        precautions.push('저혈당 대비 간식 준비');
    }
    if (conditions.includes('heart_disease')) {
        precautions.push('흉통, 어지러움 시 즉시 중단');
        precautions.push('고강도 운동 피하기');
    }
    if (conditions.includes('knee_pain') || conditions.includes('arthritis')) {
        precautions.push('점프, 달리기 등 충격 운동 피하기');
        precautions.push('무릎 통증 시 운동 강도 낮추기');
    }
    if (conditions.includes('back_pain')) {
        precautions.push('허리 굽히는 동작 주의');
        precautions.push('코어 강화 운동 우선');
    }
    if (category === 'frail') {
        precautions.push('모든 운동 시 낙상 예방을 위해 지지대 사용');
        precautions.push('처음에는 보호자 동반 권장');
    }

    return precautions;
}

/**
 * Generate weekly plan
 */
function generateWeeklyPlan(
    aerobic: AerobicPrescription,
    resistance: ResistancePrescription,
    balance: BalancePrescription | null,
    category: 'normal' | 'prefrail' | 'frail'
): WeeklyPlan {
    const minutesPerSession = Math.round(aerobic.minutesPerWeek / aerobic.frequency);

    const restDay: DayPlan = { type: 'rest', exercises: ['휴식 또는 가벼운 스트레칭'], duration: 0 };
    const aerobicDay: DayPlan = {
        type: 'aerobic',
        exercises: aerobic.examples.slice(0, 2),
        duration: minutesPerSession
    };
    const resistanceDay: DayPlan = {
        type: 'resistance',
        exercises: resistance.exercises.map(e => e.name).slice(0, 4),
        duration: 30
    };
    const combinedDay: DayPlan = {
        type: 'combined',
        exercises: balance ? [...aerobic.examples.slice(0, 1), ...balance.exercises.map(e => e.name).slice(0, 2)] : aerobic.examples.slice(0, 2),
        duration: minutesPerSession + 15,
    };

    if (category === 'frail') {
        return {
            monday: resistanceDay,
            tuesday: restDay,
            wednesday: combinedDay,
            thursday: restDay,
            friday: resistanceDay,
            saturday: restDay,
            sunday: aerobicDay,
        };
    } else {
        return {
            monday: resistanceDay,
            tuesday: aerobicDay,
            wednesday: balance ? combinedDay : restDay,
            thursday: resistanceDay,
            friday: aerobicDay,
            saturday: aerobicDay,
            sunday: restDay,
        };
    }
}

// ===== Main Function =====

export function generateExercisePrescription(data: AssessmentData): ExercisePrescription {
    const category = classifyRiskCategory(data);

    const aerobic = generateAerobicPrescription(category, data.conditions);
    const resistance = generateResistancePrescription(category, data.conditions);
    const balance = generateBalancePrescription(data);
    const flexibility = generateFlexibilityPrescription();
    const precautions = generatePrecautions(data.conditions, category);
    const weeklyPlan = generateWeeklyPlan(aerobic, resistance, balance, category);

    return {
        riskCategory: category,
        aerobic,
        resistance,
        balance,
        flexibility,
        precautions,
        weeklyPlan,
    };
}
