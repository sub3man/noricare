'use client';

import { useState } from 'react';
import styles from './page.module.css';

// 확장된 질환 목록
const conditionCategories = [
    {
        title: '만성질환',
        icon: '🏥',
        conditions: [
            { id: 'hypertension', label: '고혈압' },
            { id: 'diabetes', label: '당뇨병' },
            { id: 'hyperlipidemia', label: '고지혈증' },
            { id: 'heart_disease', label: '심장질환' },
            { id: 'stroke_history', label: '뇌졸중 이력' },
            { id: 'kidney_disease', label: '신장질환' },
            { id: 'liver_disease', label: '간질환' },
            { id: 'copd', label: '폐질환(COPD)' },
            { id: 'cancer_history', label: '암 병력' },
            { id: 'thyroid', label: '갑상선 질환' },
        ]
    },
    {
        title: '근골격계',
        icon: '🦴',
        conditions: [
            { id: 'arthritis', label: '관절염' },
            { id: 'osteoporosis', label: '골다공증' },
            { id: 'disc', label: '허리 디스크' },
            { id: 'spinal_stenosis', label: '척추관협착증' },
            { id: 'knee_surgery', label: '무릎 수술 이력' },
            { id: 'hip_surgery', label: '고관절 수술 이력' },
            { id: 'shoulder', label: '어깨 질환(오십견 등)' },
            { id: 'back_pain', label: '만성 허리통증' },
        ]
    },
    {
        title: '신경계/기타',
        icon: '🧠',
        conditions: [
            { id: 'parkinsons', label: '파킨슨병' },
            { id: 'dementia', label: '치매/인지장애' },
            { id: 'neuropathy', label: '말초신경병' },
            { id: 'dizziness', label: '만성 어지럼증' },
            { id: 'depression', label: '우울증/불안장애' },
            { id: 'insomnia', label: '수면장애' },
        ]
    }
];

// 일상생활 능력 질문
const dailyLivingQuestions = [
    { id: 'stairs', question: '계단을 혼자 오르내릴 수 있나요?', options: ['어렵다', '도움 필요', '가능하다'] },
    { id: 'shopping', question: '장보기를 혼자 할 수 있나요?', options: ['어렵다', '도움 필요', '가능하다'] },
    { id: 'heavy_lifting', question: '무거운 물건(5kg)을 들 수 있나요?', options: ['어렵다', '조금 가능', '가능하다'] },
    { id: 'walking_aid', question: '보행 보조기구를 사용하시나요?', options: ['사용함', '가끔 사용', '사용안함'] },
    { id: 'fall_history', question: '최근 1년간 넘어진 적 있나요?', options: ['3회 이상', '1-2회', '없음'] },
];

// 간편 자가 테스트
const selfTestQuestions = [
    {
        id: 'sit_stand',
        question: '의자에서 30초 동안 앉았다 일어서기 몇 회 가능한가요?',
        options: ['5회 미만', '5-9회', '10-14회', '15회 이상'],
        scores: [1, 2, 3, 4]
    },
    {
        id: 'one_leg_stand',
        question: '한 발로 10초 이상 서있을 수 있나요?',
        options: ['불가능', '5초 미만', '5-10초', '10초 이상'],
        scores: [1, 2, 3, 4]
    },
    {
        id: 'floor_touch',
        question: '서서 허리를 숙여 손이 바닥에 닿나요?',
        options: ['무릎까지만', '정강이', '발목', '바닥'],
        scores: [1, 2, 3, 4]
    },
    {
        id: 'fatigue',
        question: '평소 피로감은 어느 정도인가요?',
        options: ['매우 피곤함', '자주 피곤함', '가끔 피곤함', '거의 없음'],
        scores: [1, 2, 3, 4]
    },
];

// 운동 습관
const exerciseOptions = {
    frequency: [
        { value: 'none', label: '거의 안 함' },
        { value: 'once', label: '주 1회' },
        { value: 'twice', label: '주 2-3회' },
        { value: 'often', label: '주 4회 이상' },
    ],
    types: [
        { id: 'walking', label: '걷기/산책', icon: '🚶' },
        { id: 'stretching', label: '스트레칭', icon: '🧘' },
        { id: 'strength', label: '근력운동', icon: '💪' },
        { id: 'swimming', label: '수영', icon: '🏊' },
        { id: 'cycling', label: '자전거', icon: '🚴' },
        { id: 'dance', label: '댄스/에어로빅', icon: '💃' },
        { id: 'golf', label: '골프', icon: '⛳' },
        { id: 'hiking', label: '등산', icon: '🥾' },
    ],
    locations: [
        { value: 'home', label: '집' },
        { value: 'gym', label: '헬스장' },
        { value: 'outdoor', label: '야외' },
        { value: 'center', label: '복지관/센터' },
    ],
    duration: [
        { value: '15', label: '15분 이하' },
        { value: '30', label: '30분' },
        { value: '60', label: '1시간' },
        { value: '90', label: '1시간 이상' },
    ],
};

interface FormData {
    // Step 1: 기본정보
    age: number;
    gender: string;
    height: number;
    weight: number;
    // Step 2: 질환
    conditions: string[];
    // Step 3: 일상생활
    dailyLiving: { [key: string]: number };
    // Step 4: 자가테스트
    selfTest: { [key: string]: number };
    // Step 5: 운동습관
    exerciseFrequency: string;
    exerciseTypes: string[];
    exerciseLocation: string;
    exerciseDuration: string;
}

export default function AssessmentPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [formData, setFormData] = useState<FormData>({
        age: 65,
        gender: '',
        height: 165,
        weight: 60,
        conditions: [],
        dailyLiving: {},
        selfTest: {},
        exerciseFrequency: '',
        exerciseTypes: [],
        exerciseLocation: '',
        exerciseDuration: '',
    });

    const totalSteps = 6; // 5 steps + result

    const handleConditionToggle = (conditionId: string) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.includes(conditionId)
                ? prev.conditions.filter(c => c !== conditionId)
                : [...prev.conditions, conditionId]
        }));
    };

    const handleDailyLivingChange = (questionId: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            dailyLiving: { ...prev.dailyLiving, [questionId]: value }
        }));
    };

    const handleSelfTestChange = (questionId: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            selfTest: { ...prev.selfTest, [questionId]: value }
        }));
    };

    const handleExerciseTypeToggle = (typeId: string) => {
        setFormData(prev => ({
            ...prev,
            exerciseTypes: prev.exerciseTypes.includes(typeId)
                ? prev.exerciseTypes.filter(t => t !== typeId)
                : [...prev.exerciseTypes, typeId]
        }));
    };

    const calculateResults = () => {
        // 일상생활 점수 (0-10)
        const dailyScore = Object.values(formData.dailyLiving).reduce((a, b) => a + b, 0) /
            (dailyLivingQuestions.length * 2) * 10;

        // 신체기능 점수 (0-10)
        const selfTestScore = Object.values(formData.selfTest).reduce((a, b) => a + b, 0) /
            (selfTestQuestions.length * 4) * 10;

        // 위험 요인 수
        const riskFactors = formData.conditions.length;

        // 종합 점수
        const totalScore = (dailyScore + selfTestScore) / 2;

        // 위험도 분류
        let riskLevel = '낮음';
        let group = 'NORMAL';
        if (totalScore < 4 || riskFactors > 5) {
            riskLevel = '높음';
            group = 'FRAIL';
        } else if (totalScore < 6 || riskFactors > 3) {
            riskLevel = '보통';
            group = 'PRE_FRAIL';
        }

        return {
            group,
            analysis: {
                risk_level: riskLevel,
                daily_living_score: dailyScore.toFixed(1),
                physical_score: selfTestScore.toFixed(1),
                total_score: totalScore.toFixed(1),
                risk_factors: riskFactors,
                bmi: (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1),
            },
            recommendations: getRecommendations(group, formData.conditions),
        };
    };

    const getRecommendations = (group: string, conditions: string[]) => {
        const recs = [];

        if (group === 'FRAIL') {
            recs.push('저강도 운동부터 천천히 시작하세요');
            recs.push('전문가 상담을 권장합니다');
        } else if (group === 'PRE_FRAIL') {
            recs.push('중강도 근력 운동을 주 2-3회 권장해요');
        } else {
            recs.push('현재 상태를 유지하며 꾸준히 운동하세요');
        }

        if (conditions.includes('arthritis') || conditions.includes('knee_surgery')) {
            recs.push('관절에 무리가 가지 않는 운동을 선택하세요');
        }
        if (conditions.includes('osteoporosis')) {
            recs.push('낙상 예방을 위한 균형 운동이 중요해요');
        }
        if (conditions.includes('hypertension') || conditions.includes('heart_disease')) {
            recs.push('고강도 운동은 피하고 유산소 운동을 권장해요');
        }

        return recs.slice(0, 4);
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
            case 2: return true; // 질환 선택은 선택사항
            case 3: return Object.keys(formData.dailyLiving).length >= 3;
            case 4: return Object.keys(formData.selfTest).length >= 3;
            case 5: return !!formData.exerciseFrequency;
            default: return true;
        }
    };

    const getGroupLabel = (group: string) => {
        switch (group) {
            case 'NORMAL': return '건강';
            case 'PRE_FRAIL': return '주의';
            case 'FRAIL': return '관리 필요';
            default: return group;
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case '낮음': return 'var(--color-success)';
            case '보통': return 'var(--color-warning)';
            case '높음': return 'var(--color-error)';
            default: return 'var(--grey-500)';
        }
    };

    return (
        <div className="container animate-fade-in">
            {/* Progress Indicator */}
            <div className={styles.progressIndicator}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    {step < 6 ? `${step} / 5 단계` : '완료'}
                </span>
            </div>

            {/* Step 1: 기본 정보 */}
            {step === 1 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>👤</span>
                        <h2 className="title">기본 정보</h2>
                        <p className="caption mt-2">맞춤 운동 처방을 위한 기본 정보예요</p>
                    </div>

                    <div className="card mt-5">
                        <div className="input-group">
                            <label className="input-label">나이</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                                className="input"
                                min={18}
                                max={120}
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
                                    <span>👨</span>
                                    남성
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.genderBtn} ${formData.gender === 'F' ? styles.selected : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, gender: 'F' }))}
                                >
                                    <span>👩</span>
                                    여성
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
                                    className="input"
                                    min={100}
                                    max={220}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">몸무게 (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                                    className="input"
                                    min={30}
                                    max={200}
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
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>
                            이전
                        </button>
                        <button
                            className="btn btn-primary btn-lg flex-1"
                            onClick={() => setStep(3)}
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: 일상생활 능력 */}
            {step === 3 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>🏠</span>
                        <h2 className="title">일상생활 능력</h2>
                        <p className="caption mt-2">평소 일상생활 수행 능력을 체크해주세요</p>
                    </div>

                    <div className="card mt-5">
                        {dailyLivingQuestions.map((q, idx) => (
                            <div key={q.id} className={styles.questionItem}>
                                <p className={styles.questionText}>
                                    {idx + 1}. {q.question}
                                </p>
                                <div className={styles.optionGroup}>
                                    {q.options.map((option, optIdx) => (
                                        <button
                                            key={optIdx}
                                            className={`${styles.optionBtn} ${formData.dailyLiving[q.id] === optIdx ? styles.selected : ''}`}
                                            onClick={() => handleDailyLivingChange(q.id, optIdx)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.buttonRow}>
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(2)}>
                            이전
                        </button>
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

            {/* Step 4: 자가 테스트 */}
            {step === 4 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>📏</span>
                        <h2 className="title">간편 체력 테스트</h2>
                        <p className="caption mt-2">간단한 테스트로 체력을 측정해요</p>
                    </div>

                    <div className="card mt-5">
                        {selfTestQuestions.map((q, idx) => (
                            <div key={q.id} className={styles.questionItem}>
                                <p className={styles.questionText}>
                                    {idx + 1}. {q.question}
                                </p>
                                <div className={styles.optionGrid}>
                                    {q.options.map((option, optIdx) => (
                                        <button
                                            key={optIdx}
                                            className={`${styles.optionBtn} ${styles.gridOption} ${formData.selfTest[q.id] === q.scores[optIdx] ? styles.selected : ''}`}
                                            onClick={() => handleSelfTestChange(q.id, q.scores[optIdx])}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.buttonRow}>
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(3)}>
                            이전
                        </button>
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
                        <p className="caption mt-2">현재 운동 습관과 선호도를 알려주세요</p>
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
                            <p className={styles.questionText}>선호하는 운동 유형 (복수 선택)</p>
                            <div className={styles.exerciseTypeGrid}>
                                {exerciseOptions.types.map((type) => (
                                    <button
                                        key={type.id}
                                        className={`${styles.exerciseTypeBtn} ${formData.exerciseTypes.includes(type.id) ? styles.selected : ''}`}
                                        onClick={() => handleExerciseTypeToggle(type.id)}
                                    >
                                        <span>{type.icon}</span>
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.questionItem}>
                            <p className={styles.questionText}>주로 운동하는 장소는?</p>
                            <div className={styles.optionGroup}>
                                {exerciseOptions.locations.map((loc) => (
                                    <button
                                        key={loc.value}
                                        className={`${styles.optionBtn} ${formData.exerciseLocation === loc.value ? styles.selected : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, exerciseLocation: loc.value }))}
                                    >
                                        {loc.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.questionItem}>
                            <p className={styles.questionText}>하루 운동 가능 시간은?</p>
                            <div className={styles.optionGroup}>
                                {exerciseOptions.duration.map((dur) => (
                                    <button
                                        key={dur.value}
                                        className={`${styles.optionBtn} ${formData.exerciseDuration === dur.value ? styles.selected : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, exerciseDuration: dur.value }))}
                                    >
                                        {dur.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonRow}>
                        <button className="btn btn-secondary btn-lg" onClick={() => setStep(4)}>
                            이전
                        </button>
                        <button
                            className="btn btn-primary btn-lg flex-1"
                            onClick={handleSubmit}
                            disabled={isLoading || !canProceed(5)}
                        >
                            {isLoading ? '분석 중...' : '결과 보기'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 6: 결과 */}
            {step === 6 && result && (
                <div className={styles.stepContent}>
                    <div className={styles.resultHeader}>
                        <div className={styles.resultIcon}>✅</div>
                        <h2 className="title">분석 완료!</h2>
                        <p className="caption mt-2">{formData.age}세 {formData.gender === 'M' ? '남성' : '여성'} 맞춤 분석 결과</p>
                    </div>

                    <div className={`card ${styles.resultCard} mt-5`}>
                        <div className={styles.resultGroup}>
                            <span className="caption">건강 상태</span>
                            <span
                                className={styles.groupBadge}
                                style={{ backgroundColor: getRiskColor(result.analysis.risk_level) }}
                            >
                                {getGroupLabel(result.group)}
                            </span>
                        </div>

                        <div className="divider" />

                        <div className={styles.scoreGrid}>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>일상생활</span>
                                <span className={styles.scoreValue}>{result.analysis.daily_living_score}점</span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>신체기능</span>
                                <span className={styles.scoreValue}>{result.analysis.physical_score}점</span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>BMI</span>
                                <span className={styles.scoreValue}>{result.analysis.bmi}</span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className={styles.scoreLabel}>위험요인</span>
                                <span className={styles.scoreValue} style={{ color: result.analysis.risk_factors > 3 ? 'var(--color-error)' : 'inherit' }}>
                                    {result.analysis.risk_factors}개
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-4">
                        <h3 className="subtitle mb-3">💡 맞춤 권장 사항</h3>
                        <ul className={styles.recommendList}>
                            {result.recommendations.map((rec: string, idx: number) => (
                                <li key={idx}>{rec}</li>
                            ))}
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
                            setFormData({
                                age: 65,
                                gender: '',
                                height: 165,
                                weight: 60,
                                conditions: [],
                                dailyLiving: {},
                                selfTest: {},
                                exerciseFrequency: '',
                                exerciseTypes: [],
                                exerciseLocation: '',
                                exerciseDuration: '',
                            });
                        }}
                    >
                        다시 평가하기
                    </button>
                </div>
            )}
        </div>
    );
}
