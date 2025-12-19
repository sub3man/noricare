'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface PHRData {
    age: number;
    gender: string;
    sppb: number;
    tug: number;
    conditions: string[];
}

interface DiagnosisResult {
    group: string;
    analysis: {
        risk_level: string;
        frailty_score: number;
        mobility_score: number;
        trend: string;
    };
}

const conditionOptions = [
    { id: 'hypertension', label: '고혈압', icon: '❤️' },
    { id: 'diabetes', label: '당뇨병', icon: '🩸' },
    { id: 'arthritis', label: '관절염', icon: '🦴' },
    { id: 'heart_disease', label: '심장 질환', icon: '💗' },
    { id: 'osteoporosis', label: '골다공증', icon: '🦷' },
    { id: 'back_pain', label: '허리 통증', icon: '🔙' },
];

export default function AssessmentPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);

    const [formData, setFormData] = useState<PHRData>({
        age: 35,
        gender: '',
        sppb: 0,
        tug: 0,
        conditions: [],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' || name === 'sppb' || name === 'tug' ? Number(value) : value
        }));
    };

    const handleConditionToggle = (conditionId: string) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.includes(conditionId)
                ? prev.conditions.filter(c => c !== conditionId)
                : [...prev.conditions, conditionId]
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock result
        setResult({
            group: 'MODERATE',
            analysis: {
                risk_level: '보통',
                frailty_score: 0.35,
                mobility_score: 0.72,
                trend: 'IMPROVING',
            }
        });

        setIsLoading(false);
        setStep(3);
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case '낮음': return 'var(--color-success)';
            case '보통': return 'var(--color-warning)';
            case '높음': return 'var(--color-error)';
            default: return 'var(--grey-500)';
        }
    };

    const getGroupLabel = (group: string) => {
        switch (group) {
            case 'LOW_RISK': return '저위험군';
            case 'MODERATE': return '중간위험군';
            case 'HIGH_RISK': return '고위험군';
            default: return group;
        }
    };

    return (
        <div className="container animate-fade-in">
            {/* Progress Indicator */}
            <div className={styles.progressIndicator}>
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`${styles.progressStep} ${step >= s ? styles.active : ''} ${step === s ? styles.current : ''}`}
                    >
                        <div className={styles.stepNumber}>{s}</div>
                        <span className={styles.stepLabel}>
                            {s === 1 ? '기본 정보' : s === 2 ? '건강 상태' : '결과'}
                        </span>
                    </div>
                ))}
                <div className={styles.progressLine}>
                    <div
                        className={styles.progressLineFill}
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <h2 className="title">기본 정보를 입력해주세요</h2>
                        <p className="caption mt-2">맞춤형 운동 처방을 위해 필요해요</p>
                    </div>

                    <div className="card mt-5">
                        <div className="input-group">
                            <label className="input-label">나이</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                className="input"
                                min={18}
                                max={100}
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
                    </div>

                    <button
                        className="btn btn-primary btn-lg btn-block mt-6"
                        onClick={() => setStep(2)}
                        disabled={!formData.gender}
                    >
                        다음
                    </button>
                </div>
            )}

            {/* Step 2: Health Info */}
            {step === 2 && (
                <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                        <h2 className="title">건강 정보를 입력해주세요</h2>
                        <p className="caption mt-2">정확한 진단을 위해 필요해요</p>
                    </div>

                    <div className="card mt-5">
                        <div className="input-group">
                            <label className="input-label">
                                SPPB 점수
                                <span className={styles.labelHelper}>(0-12점)</span>
                            </label>
                            <input
                                type="number"
                                name="sppb"
                                value={formData.sppb}
                                onChange={handleInputChange}
                                className="input"
                                min={0}
                                max={12}
                                placeholder="0-12 사이 점수"
                            />
                            <p className="input-helper">Short Physical Performance Battery</p>
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                TUG 시간
                                <span className={styles.labelHelper}>(초)</span>
                            </label>
                            <input
                                type="number"
                                name="tug"
                                value={formData.tug}
                                onChange={handleInputChange}
                                className="input"
                                min={0}
                                step={0.1}
                                placeholder="Time Up and Go 측정 시간"
                            />
                            <p className="input-helper">일어나서 3m 걸어갔다 돌아오는 시간</p>
                        </div>
                    </div>

                    <div className="card mt-4">
                        <h3 className="subtitle mb-4">기저 질환 선택</h3>
                        <div className={styles.conditionGrid}>
                            {conditionOptions.map((condition) => (
                                <button
                                    key={condition.id}
                                    type="button"
                                    className={`${styles.conditionBtn} ${formData.conditions.includes(condition.id) ? styles.selected : ''}`}
                                    onClick={() => handleConditionToggle(condition.id)}
                                >
                                    <span className={styles.conditionIcon}>{condition.icon}</span>
                                    <span>{condition.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.buttonRow}>
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => setStep(1)}
                        >
                            이전
                        </button>
                        <button
                            className="btn btn-primary btn-lg flex-1"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? '분석 중...' : '진단받기'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && result && (
                <div className={styles.stepContent}>
                    <div className={styles.resultHeader}>
                        <div className={styles.resultIcon}>✅</div>
                        <h2 className="title">분석이 완료되었어요!</h2>
                    </div>

                    <div className={`card ${styles.resultCard} mt-5`}>
                        <div className={styles.resultGroup}>
                            <span className="caption">분류 결과</span>
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
                                <span className="caption">위험도</span>
                                <span
                                    className={styles.scoreValue}
                                    style={{ color: getRiskColor(result.analysis.risk_level) }}
                                >
                                    {result.analysis.risk_level}
                                </span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className="caption">노쇠 지수</span>
                                <span className={styles.scoreValue}>
                                    {(result.analysis.frailty_score * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className="caption">이동 능력</span>
                                <span className={styles.scoreValue}>
                                    {(result.analysis.mobility_score * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span className="caption">추세</span>
                                <span className={`${styles.scoreValue} text-success`}>
                                    📈 개선 중
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-4">
                        <h3 className="subtitle mb-3">💡 권장 사항</h3>
                        <ul className={styles.recommendList}>
                            <li>중강도 근력 운동을 주 3회 권장해요</li>
                            <li>유연성 운동을 매일 10분 이상 해보세요</li>
                            <li>균형 운동으로 낙상 예방을 해보세요</li>
                        </ul>
                    </div>

                    <button
                        className="btn btn-primary btn-lg btn-block mt-6"
                        onClick={() => {
                            window.location.href = '/exercise';
                        }}
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
