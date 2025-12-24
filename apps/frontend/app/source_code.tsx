'use client';

import { useState } from 'react';
import styles from './page.module.css';

// FRAIL Scale (국제 표준 노쇠 평가)
const frailQuestions = [
    {
        id: 'fatigue',
        question: '지난 한 달간 피로감을 자주 느끼셨나요?',
        subtext: 'FRAIL - Fatigue',
        options: ['아니오', '예'],
        scores: [0, 1]
    },
    {
        id: 'resistance',
        question: '혼자서 쉬지 않고 10계단을 오르기 어려우신가요?',
        subtext: 'FRAIL - Resistance',
        options: ['아니오', '예'],
        scores: [0, 1]
    },
    {
        id: 'ambulation',
        question: '혼자서 300미터(약 5분 거리)를 걷기 어려우신가요?',
        subtext: 'FRAIL - Ambulation',
        options: ['아니오', '예'],
        scores: [0, 1]
    },
    {
        id: 'illness',
        question: '현재 5개 이상의 질환을 앓고 계신가요?',
        subtext: 'FRAIL - Illness',
        options: ['아니오', '예'],
        scores: [0, 1]
    },
    {
        id: 'weight_loss',
        question: '최근 1년간 의도치 않게 체중이 5% 이상 줄었나요?',
        subtext: 'FRAIL - Loss of weight',
        options: ['아니오', '예'],
        scores: [0, 1]
    },
];

// SARC-F (근감소증 선별 도구)
const sarcfQuestions = [
    {
        id: 'strength',
        question: '4.5kg (쌀 한 포대) 물건을 들어 옮기는 것이 얼마나 어렵나요?',
        subtext: 'SARC-F - Strength',
        options: ['전혀 어렵지 않음', '약간 어려움', '매우 어렵거나 불가능'],
        scores: [0, 1, 2]
    },
    {
        id: 'walking',
        question: '방 한쪽 끝에서 다른 끝까지 걷는 것이 얼마나 어렵나요?',
        subtext: 'SARC-F - Assistance walking',
        options: ['전혀 어렵지 않음', '약간 어려움', '매우 어렵거나 보조기구 필요'],
        scores: [0, 1, 2]
    },
    {
        id: 'chair',
        question: '의자나 침대에서 일어나는 것이 얼마나 어렵나요?',
        subtext: 'SARC-F - Rise from chair',
        options: ['전혀 어렵지 않음', '약간 어려움', '매우 어렵거나 도움 필요'],
        scores: [0, 1, 2]
    },
    {
        id: 'stairs',
        question: '10계단을 오르는 것이 얼마나 어렵나요?',
        subtext: 'SARC-F - Climb stairs',
        options: ['전혀 어렵지 않음', '약간 어려움', '매우 어렵거나 불가능'],
        scores: [0, 1, 2]
    },
    {
        id: 'falls',
        question: '지난 1년간 몇 번 넘어지셨나요?',
        subtext: 'SARC-F - Falls',
        options: ['없음', '1-3회', '4회 이상'],
        scores: [0, 1, 2]
    },
];

// 확장된 질환 목록
const conditionCategories = [
    {
        title: '심혈관/대사질환',
        icon: '❤️',
        conditions: [
            { id: 'hypertension', label: '고혈압' },
            { id: 'diabetes', label: '당뇨병' },
            { id: 'hyperlipidemia', label: '고지혈증' },
            { id: 'heart_disease', label: '심장질환 (협심증, 심부전)' },
            { id: 'stroke_history', label: '뇌졸중 병력' },
            { id: 'arrhythmia', label: '부정맥' },
        ]
    },
    {
        title: '근골격계',
        icon: '🦴',
        conditions: [
            { id: 'arthritis', label: '관절염 (류마티스/퇴행성)' },
            { id: 'osteoporosis', label: '골다공증' },
            { id: 'disc', label: '허리 디스크' },
            { id: 'spinal_stenosis', label: '척추관협착증' },
            { id: 'knee_surgery', label: '무릎 수술 이력' },
            { id: 'hip_surgery', label: '고관절 수술 이력' },
            { id: 'shoulder', label: '어깨 질환' },
            { id: 'sarcopenia', label: '근감소증 진단' },
        ]
    },
    {
        title: '호흡기/내과',
        icon: '🫁',
        conditions: [
            { id: 'copd', label: '만성폐쇄성폐질환(COPD)' },
            { id: 'asthma', label: '천식' },
            { id: 'kidney_disease', label: '만성신장질환' },
            { id: 'liver_disease', label: '간질환' },
            { id: 'thyroid', label: '갑상선 질환' },
            { id: 'cancer_history', label: '암 병력' },
        ]
    },
    {
        title: '신경/정신',
        icon: '🧠',
        conditions: [
            { id: 'parkinsons', label: '파킨슨병' },
            { id: 'dementia', label: '치매/경도인지장애' },
            { id: 'neuropathy', label: '말초신경병' },
            { id: 'dizziness', label: '어지럼증/전정기능장애' },
            { id: 'depression', label: '우울증' },
            { id: 'anxiety', label: '불안장애' },
            { id: 'insomnia', label: '수면장애' },
        ]
    }
];

// 운동 습관 옵션
const exerciseOptions = {
    frequency: [
        { value: 'none', label: '거의 안 함' },
        { value: 'once', label: '주 1회' },
        { value: 'twice', label: '주 2-3회' },
        { value: 'often', label: '주 4회 이상' },
    ],
    types: [
        { id: 'walking', label: '걷기', icon: '🚶' },
        { id: 'stretching', label: '스트레칭', icon: '🧘' },
        { id: 'strength', label: '근력운동', icon: '💪' },
        { id: 'swimming', label: '수영', icon: '🏊' },
        { id: 'cycling', label: '자전거', icon: '🚴' },
        { id: 'dance', label: '댄스', icon: '💃' },
    ],
};

interface FormData {
    age: number;
    gender: string;
    height: number;
    weight: number;
    conditions: string[];
    frail: { [key: string]: number };
    sarcf: { [key: string]: number };
    exerciseFrequency: string;
    exerciseTypes: string[];
}

interface DiagnosisResult {
    frailScore: number;
    frailCategory: string;
    sarcfScore: number;
    sarcfCategory: string;
    bmi: number;
    bmiCategory: string;
    riskFactors: string[];
    findings: string[];
    recommendations: { category: string; text: string; source: string }[];
    exercisePrescription: { type: string; frequency: string; intensity: string; caution?: string }[];
}

export default function AssessmentPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);

    const [formData, setFormData] = useState<FormData>({
        age: 65,
        gender: '',
        height: 165,
        weight: 60,
        conditions: [],
        frail: {},
        sarcf: {},
        exerciseFrequency: '',
        exerciseTypes: [],
    });

    const totalSteps = 6;

    const handleConditionToggle = (id: string) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.includes(id)
                ? prev.conditions.filter(c => c !== id)
                : [...prev.conditions, id]
        }));
    };

    const handleFrailChange = (id: string, score: number) => {
        setFormData(prev => ({
            ...prev,
            frail: { ...prev.frail, [id]: score }
        }));
    };

    const handleSarcfChange = (id: string, score: number) => {
        setFormData(prev => ({
            ...prev,
            sarcf: { ...prev.sarcf, [id]: score }
        }));
    };

    const calculateResults = (): DiagnosisResult => {
        // FRAIL 점수 계산 (0-5점)
        const frailScore = Object.values(formData.frail).reduce((a, b) => a + b, 0);
        let frailCategory = '건강(Robust)';
        if (frailScore >= 3) frailCategory = '노쇠(Frail)';
        else if (frailScore >= 1) frailCategory = '전노쇠(Pre-frail)';

        // SARC-F 점수 계산 (0-10점)
        const sarcfScore = Object.values(formData.sarcf).reduce((a, b) => a + b, 0);
        let sarcfCategory = '정상';
        if (sarcfScore >= 4) sarcfCategory = '근감소증 의심';

        // BMI 계산
        const bmi = formData.weight / Math.pow(formData.height / 100, 2);
        let bmiCategory = '정상';
        if (bmi < 18.5) bmiCategory = '저체중';
        else if (bmi >= 23 && bmi < 25) bmiCategory = '과체중';
        else if (bmi >= 25) bmiCategory = '비만';

        // 위험 요인 분석
        const riskFactors: string[] = [];
        if (frailScore >= 3) riskFactors.push('노쇠 상태');
        if (sarcfScore >= 4) riskFactors.push('근감소증 의심');
        if (bmi < 18.5 || bmi >= 25) riskFactors.push('BMI 이상');
        if (formData.conditions.includes('diabetes')) riskFactors.push('당뇨병');
        if (formData.conditions.includes('heart_disease')) riskFactors.push('심장질환');
        if (formData.conditions.includes('osteoporosis')) riskFactors.push('골다공증');
        if (formData.frail['falls'] === 2) riskFactors.push('반복 낙상 이력');

        // 주요 발견사항
        const findings: string[] = [];
        if (formData.frail['fatigue'] === 1) findings.push('피로감 호소 - 영양 상태, 수면, 빈혈 등 점검 권장');
        if (formData.frail['resistance'] === 1 || formData.sarcf['stairs'] >= 1)
            findings.push('하지 근력 저하 추정 - 근력 강화 운동 필수');
        if (formData.sarcf['falls'] >= 1)
            findings.push('낙상 경험 있음 - 균형 훈련 및 환경 점검 권장');
        if (formData.frail['weight_loss'] === 1)
            findings.push('체중 감소 - 영양 보충 및 원인 파악 필요');
        if (formData.conditions.includes('osteoporosis'))
            findings.push('골다공증 - 낙상 시 골절 위험, 균형 운동 우선');
        if (sarcfScore >= 4 && formData.age >= 65)
            findings.push('근감소증 의심 - 전문가 상담 및 정밀 검사 권장');

        // 맞춤 권장사항 (가이드라인 기반)
        const recommendations: { category: string; text: string; source: string }[] = [];

        // FRAIL 기반 권장
        if (frailScore >= 3) {
            recommendations.push({
                category: '전문 상담',
                text: '노쇠 상태로 판단됩니다. 노인의학 전문의 상담을 권장합니다.',
                source: '대한노인병학회 노쇠 관리 권고안'
            });
            recommendations.push({
                category: '영양',
                text: '단백질 섭취를 체중 kg당 1.2g 이상으로 늘리세요.',
                source: 'ESPEN 노인 영양 가이드라인'
            });
        } else if (frailScore >= 1) {
            recommendations.push({
                category: '예방',
                text: '전노쇠 단계입니다. 규칙적인 운동과 영양 관리가 중요합니다.',
                source: 'WHO 건강노화 권고안'
            });
        }

        // SARC-F 기반 권장
        if (sarcfScore >= 4) {
            recommendations.push({
                category: '근력 강화',
                text: '저항성 운동을 주 2-3회, 주요 근육군별로 8-12회씩 실시하세요.',
                source: 'ACSM 운동 처방 지침'
            });
            recommendations.push({
                category: '단백질',
                text: '매 식사마다 단백질 20-30g을 섭취하세요.',
                source: 'ESPEN 근감소증 관리 권고안'
            });
        }

        // 질환 조합 기반 권장
        if (formData.conditions.includes('hypertension') || formData.conditions.includes('heart_disease')) {
            recommendations.push({
                category: '심혈관',
                text: '고강도 운동은 피하고, 중강도 유산소 운동 주 150분을 권장합니다.',
                source: 'AHA/ACC 운동 권고안'
            });
        }

        if (formData.conditions.includes('arthritis') || formData.conditions.includes('knee_surgery')) {
            recommendations.push({
                category: '관절 보호',
                text: '관절에 충격이 적은 수중 운동, 자전거, 의자 운동을 권장합니다.',
                source: '대한류마티스학회 운동 권고안'
            });
        }

        if (formData.conditions.includes('osteoporosis')) {
            recommendations.push({
                category: '낙상 예방',
                text: '균형 운동과 하지 근력 운동을 우선하고, 충격이 큰 운동은 제한하세요.',
                source: 'NOF 골다공증 운동 가이드라인'
            });
        }

        if (formData.conditions.includes('diabetes')) {
            recommendations.push({
                category: '혈당 관리',
                text: '식후 30분 이내 가벼운 걷기(10-15분)가 혈당 조절에 효과적입니다.',
                source: 'ADA 당뇨병 관리 지침'
            });
        }

        if (formData.conditions.includes('depression') || formData.conditions.includes('anxiety')) {
            recommendations.push({
                category: '정신건강',
                text: '규칙적인 유산소 운동이 우울감과 불안 개선에 도움됩니다.',
                source: 'NICE 우울증 가이드라인'
            });
        }

        // 운동 처방
        const exercisePrescription: DiagnosisResult['exercisePrescription'] = [];

        // 유산소 운동
        let aerobicIntensity = '중강도';
        if (frailScore >= 3 || formData.conditions.includes('heart_disease')) {
            aerobicIntensity = '저강도';
        }
        exercisePrescription.push({
            type: '유산소 운동 (걷기, 수영)',
            frequency: '주 3-5회, 회당 20-30분',
            intensity: aerobicIntensity,
            caution: formData.conditions.includes('heart_disease') ? '심박수 모니터링 권장' : undefined
        });

        // 근력 운동
        let strengthIntensity = '중강도 (10-15회 반복 가능한 무게)';
        if (frailScore >= 3) {
            strengthIntensity = '저강도 (체중 또는 밴드 이용)';
        }
        exercisePrescription.push({
            type: '근력 운동',
            frequency: '주 2-3회',
            intensity: strengthIntensity,
            caution: formData.conditions.includes('arthritis') ? '관절 가동 범위 내에서만 실시' : undefined
        });

        // 균형 운동
        if (formData.sarcf['falls'] >= 1 || formData.conditions.includes('osteoporosis') || formData.age >= 70) {
            exercisePrescription.push({
                type: '균형 훈련',
                frequency: '주 2-3회',
                intensity: '점진적으로 난이도 증가',
                caution: '안전한 환경에서 실시 (벽, 의자 잡을 수 있도록)'
            });
        }

        // 유연성 운동
        exercisePrescription.push({
            type: '스트레칭',
            frequency: '매일 10-15분',
            intensity: '통증 없는 범위까지',
        });

        return {
            frailScore,
            frailCategory,
            sarcfScore,
            sarcfCategory,
            bmi: Math.round(bmi * 10) / 10,
            bmiCategory,
            riskFactors,
            findings,
            recommendations,
            exercisePrescription,
        };
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResult(calculateResults());
        setIsLoading(false);
        setStep(6);
    };

    const canProceed = (currentStep: number): boolean => {
        switch (currentStep) {
            case 1: return !!formData.gender && formData.age > 0;
            case 2: return true;
            case 3: return Object.keys(formData.frail).length >= 3;
            case 4: return Object.keys(formData.sarcf).length >= 3;
            case 5: return true;
            default: return true;
        }
    };

    const getFrailColor = (category: string) => {
        switch (category) {
            case '건강(Robust)': return 'var(--color-success)';
            case '전노쇠(Pre-frail)': return 'var(--color-warning)';
            case '노쇠(Frail)': return 'var(--color-error)';
            default: return 'var(--grey-500)';
        }
    };

    return (
        <div className="container animate-fade-in">
            {/* Progress */}
            <div className={styles.progressIndicator}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    {step < 6 ? `${step}/5` : '완료'}
                </span>
            </div>

            {/* Step 1: 기본 정보 */}
            {step === 1 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>👤</span>
                        <h2 className="title">기본 정보</h2>
                        <p className="caption mt-2">맞춤 건강 평가를 위한 기본 정보예요</p>
                    </div>

                    <div className="card mt-5">
                        <div className="input-group">
                            <label className="input-label">나이</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                                className="input"
                                min={18} max={120}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">성별</label>
                            <div className={styles.genderSelect}>
                                <button
                                    type="button"
                                    className={`${styles.genderBtn} ${formData.gender === 'M' ? styles.selected : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, gender: 'M' }))}
                                >
                                    <span>👨</span> 남성
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.genderBtn} ${formData.gender === 'F' ? styles.selected : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, gender: 'F' }))}
                                >
                                    <span>👩</span> 여성
                                </button>
                            </div>
                        </div>

                        <div className={styles.rowInputs}>
                            <div className="input-group">
                                <label className="input-label">키 (cm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData(prev => ({ ...prev, height: Number(e.target.value) }))}
                                    className="input" min={100} max={220}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">몸무게 (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                                    className="input" min={30} max={200}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-lg btn-block mt-6"
                        onClick={() => setStep(2)}
                        disabled={!canProceed(1)}
                    >
                        다음
                    </button>
                </div>
            )}

            {/* Step 2: 질환 정보 */}
            {step === 2 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>🏥</span>
                        <h2 className="title">건강 상태</h2>
                        <p className="caption mt-2">해당하는 질환을 모두 선택해주세요</p>
                    </div>

                    {conditionCategories.map((category, idx) => (
                        <div key={idx} className="card mt-4">
                            <h3 className={styles.categoryTitle}>
                                <span>{category.icon}</span>
                                {category.title}
                            </h3>
                            <div className={styles.conditionGrid}>
                                {category.conditions.map((condition) => (
                                    <button
                                        key={condition.id}
                                        type="button"
                                        className={`${styles.conditionBtn} ${formData.conditions.includes(condition.id) ? styles.selected : ''}`}
                                        onClick={() => handleConditionToggle(condition.id)}
                                    >
                                        {condition.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className={styles.selectedCount}>
                        선택된 질환: {formData.conditions.length}개
                    </div>

                    <div className={styles.buttonRow}>
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>이전</button>
                        <button className="btn btn-primary btn-lg flex-1" onClick={() => setStep(3)}>다음</button>
                    </div>
                </div>
            )}

            {/* Step 3: FRAIL Scale */}
            {step === 3 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>📋</span>
                        <h2 className="title">노쇠 평가 (FRAIL)</h2>
                        <p className="caption mt-2">국제 표준 노쇠 선별 도구입니다</p>
                    </div>

                    <div className="card mt-5">
                        {frailQuestions.map((q, idx) => (
                            <div key={q.id} className={styles.questionItem}>
                                <p className={styles.questionText}>
                                    {idx + 1}. {q.question}
                                </p>
                                <span className={styles.questionSubtext}>{q.subtext}</span>
                                <div className={styles.optionGroup}>
                                    {q.options.map((option, optIdx) => (
                                        <button
                                            key={optIdx}
                                            className={`${styles.optionBtn} ${formData.frail[q.id] === q.scores[optIdx] ? styles.selected : ''}`}
                                            onClick={() => handleFrailChange(q.id, q.scores[optIdx])}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.buttonRow}>
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(2)}>이전</button>
                        <button
                            className="btn btn-primary btn-lg flex-1"
                            onClick={() => setStep(4)}
                            disabled={!canProceed(3)}
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: SARC-F */}
            {step === 4 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>💪</span>
                        <h2 className="title">근감소증 선별 (SARC-F)</h2>
                        <p className="caption mt-2">근력 및 신체 기능을 평가합니다</p>
                    </div>

                    <div className="card mt-5">
                        {sarcfQuestions.map((q, idx) => (
                            <div key={q.id} className={styles.questionItem}>
                                <p className={styles.questionText}>
                                    {idx + 1}. {q.question}
                                </p>
                                <span className={styles.questionSubtext}>{q.subtext}</span>
                                <div className={styles.optionGroup}>
                                    {q.options.map((option, optIdx) => (
                                        <button
                                            key={optIdx}
                                            className={`${styles.optionBtn} ${styles.optionSmall} ${formData.sarcf[q.id] === q.scores[optIdx] ? styles.selected : ''}`}
                                            onClick={() => handleSarcfChange(q.id, q.scores[optIdx])}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.buttonRow}>
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(3)}>이전</button>
                        <button
                            className="btn btn-primary btn-lg flex-1"
                            onClick={() => setStep(5)}
                            disabled={!canProceed(4)}
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            {/* Step 5: 운동 습관 */}
            {step === 5 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>🏃</span>
                        <h2 className="title">운동 습관</h2>
                        <p className="caption mt-2">현재 운동 습관을 알려주세요</p>
                    </div>

                    <div className="card mt-5">
                        <div className={styles.questionItem}>
                            <p className={styles.questionText}>현재 운동 빈도는?</p>
                            <div className={styles.optionGroup}>
                                {exerciseOptions.frequency.map((opt) => (
                                    <button
                                        key={opt.value}
                                        className={`${styles.optionBtn} ${formData.exerciseFrequency === opt.value ? styles.selected : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, exerciseFrequency: opt.value }))}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.questionItem}>
                            <p className={styles.questionText}>선호하는 운동 (복수 선택)</p>
                            <div className={styles.exerciseTypeGrid}>
                                {exerciseOptions.types.map((type) => (
                                    <button
                                        key={type.id}
                                        className={`${styles.exerciseTypeBtn} ${formData.exerciseTypes.includes(type.id) ? styles.selected : ''}`}
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            exerciseTypes: prev.exerciseTypes.includes(type.id)
                                                ? prev.exerciseTypes.filter(t => t !== type.id)
                                                : [...prev.exerciseTypes, type.id]
                                        }))}
                                    >
                                        <span>{type.icon}</span>
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonRow}>
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(4)}>이전</button>
                        <button
                            className="btn btn-primary btn-lg flex-1"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? '분석 중...' : '결과 보기'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 6: 상세 결과 */}
            {step === 6 && result && (
                <div className={styles.stepContent}>
                    <div className={styles.resultHeader}>
                        <div className={styles.resultIcon}>📊</div>
                        <h2 className="title">건강 분석 결과</h2>
                        <p className="caption mt-2">{formData.age}세 {formData.gender === 'M' ? '남성' : '여성'}</p>
                    </div>

                    {/* 핵심 지표 */}
                    <div className={`card ${styles.resultCard} mt-5`}>
                        <h3 className={styles.resultSectionTitle}>📊 핵심 건강 지표</h3>
                        <div className={styles.scoreGrid}>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>FRAIL 점수</span>
                                <span className={styles.scoreValue} style={{ color: getFrailColor(result.frailCategory) }}>
                                    {result.frailScore}/5
                                </span>
                                <span className={styles.scoreCategory} style={{ color: getFrailColor(result.frailCategory) }}>
                                    {result.frailCategory}
                                </span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>SARC-F 점수</span>
                                <span className={styles.scoreValue} style={{ color: result.sarcfScore >= 4 ? 'var(--color-error)' : 'var(--color-success)' }}>
                                    {result.sarcfScore}/10
                                </span>
                                <span className={styles.scoreCategory}>
                                    {result.sarcfCategory}
                                </span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>BMI</span>
                                <span className={styles.scoreValue}>
                                    {result.bmi}
                                </span>
                                <span className={styles.scoreCategory}>
                                    {result.bmiCategory}
                                </span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>위험 요인</span>
                                <span className={styles.scoreValue} style={{ color: result.riskFactors.length > 2 ? 'var(--color-error)' : 'inherit' }}>
                                    {result.riskFactors.length}개
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 주요 발견사항 */}
                    {result.findings.length > 0 && (
                        <div className="card mt-4">
                            <h3 className={styles.resultSectionTitle}>🔍 주요 발견사항</h3>
                            <ul className={styles.findingsList}>
                                {result.findings.map((finding, idx) => (
                                    <li key={idx}>{finding}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 위험 요인 */}
                    {result.riskFactors.length > 0 && (
                        <div className="card mt-4">
                            <h3 className={styles.resultSectionTitle}>⚠️ 주의가 필요한 부분</h3>
                            <div className={styles.riskTags}>
                                {result.riskFactors.map((risk, idx) => (
                                    <span key={idx} className={styles.riskTag}>{risk}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 맞춤 권장사항 */}
                    <div className="card mt-4">
                        <h3 className={styles.resultSectionTitle}>💡 맞춤 권장사항</h3>
                        {result.recommendations.map((rec, idx) => (
                            <div key={idx} className={styles.recommendItem}>
                                <span className={styles.recommendCategory}>{rec.category}</span>
                                <p className={styles.recommendText}>{rec.text}</p>
                                <span className={styles.recommendSource}>📚 {rec.source}</span>
                            </div>
                        ))}
                    </div>

                    {/* 운동 처방 */}
                    <div className="card mt-4">
                        <h3 className={styles.resultSectionTitle}>🏋️ 맞춤 운동 처방</h3>
                        {result.exercisePrescription.map((ex, idx) => (
                            <div key={idx} className={styles.exerciseRx}>
                                <div className={styles.exerciseRxHeader}>
                                    <strong>{ex.type}</strong>
                                    <span className={styles.exerciseFreq}>{ex.frequency}</span>
                                </div>
                                <p className={styles.exerciseIntensity}>강도: {ex.intensity}</p>
                                {ex.caution && (
                                    <p className={styles.exerciseCaution}>⚠️ {ex.caution}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 참고 가이드라인 */}
                    <div className={`card mt-4 ${styles.guidelineCard}`}>
                        <h3 className={styles.resultSectionTitle}>📖 참고 가이드라인</h3>
                        <ul className={styles.guidelineList}>
                            <li>FRAIL Scale - Morley et al. (2012)</li>
                            <li>SARC-F - Malmstrom & Morley (2013)</li>
                            <li>대한노인병학회 노쇠 관리 권고안</li>
                            <li>WHO 신체활동 가이드라인 (2020)</li>
                            <li>ACSM 노인 운동 처방 지침</li>
                        </ul>
                    </div>

                    <button
                        className="btn btn-primary btn-lg btn-block mt-6"
                        onClick={() => window.location.href = '/exercise'}
                    >
                        맞춤 운동 확인하기
                    </button>

                    <button
                        className="btn btn-ghost btn-block mt-3"
                        onClick={() => {
                            setStep(1);
                            setResult(null);
                        }}
                    >
                        다시 평가하기
                    </button>
                </div>
            )}
        </div>
    );
}
