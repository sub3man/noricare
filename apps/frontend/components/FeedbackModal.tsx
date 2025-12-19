'use client';

import { useState } from 'react';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
    exerciseName: string;
    onSubmit: (feedback: FeedbackData) => void;
    onClose: () => void;
}

export interface FeedbackData {
    rpe: number;
    painLevel: number;
    painAreas: string[];
    difficulty: 'easy' | 'just_right' | 'hard';
    notes: string;
    timestamp: string;
}

const bodyParts = [
    { id: 'neck', label: '목', top: 15, left: 50 },
    { id: 'shoulder_l', label: '왼쪽 어깨', top: 22, left: 35 },
    { id: 'shoulder_r', label: '오른쪽 어깨', top: 22, left: 65 },
    { id: 'back', label: '허리/등', top: 38, left: 50 },
    { id: 'hip_l', label: '왼쪽 고관절', top: 50, left: 38 },
    { id: 'hip_r', label: '오른쪽 고관절', top: 50, left: 62 },
    { id: 'knee_l', label: '왼쪽 무릎', top: 68, left: 42 },
    { id: 'knee_r', label: '오른쪽 무릎', top: 68, left: 58 },
    { id: 'ankle_l', label: '왼쪽 발목', top: 85, left: 42 },
    { id: 'ankle_r', label: '오른쪽 발목', top: 85, left: 58 },
    { id: 'wrist_l', label: '왼쪽 손목', top: 50, left: 20 },
    { id: 'wrist_r', label: '오른쪽 손목', top: 50, left: 80 },
];

const rpeDescriptions: { [key: number]: string } = {
    1: '매우 가벼움',
    2: '가벼움',
    3: '조금 가벼움',
    4: '약간 힘듦',
    5: '힘듦',
    6: '많이 힘듦',
    7: '매우 힘듦',
    8: '극도로 힘듦',
    9: '거의 최대',
    10: '최대 힘듦',
};

export default function FeedbackModal({ exerciseName, onSubmit, onClose }: FeedbackModalProps) {
    const [step, setStep] = useState(1);
    const [feedback, setFeedback] = useState<FeedbackData>({
        rpe: 5,
        painLevel: 0,
        painAreas: [],
        difficulty: 'just_right',
        notes: '',
        timestamp: new Date().toISOString(),
    });

    const handlePainAreaToggle = (areaId: string) => {
        setFeedback(prev => ({
            ...prev,
            painAreas: prev.painAreas.includes(areaId)
                ? prev.painAreas.filter(a => a !== areaId)
                : [...prev.painAreas, areaId]
        }));
    };

    const handleSubmit = () => {
        onSubmit({
            ...feedback,
            timestamp: new Date().toISOString(),
        });
    };

    const getRpeColor = (value: number) => {
        if (value <= 3) return '#4CAF50';
        if (value <= 6) return '#FF9800';
        return '#F44336';
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.headerIcon}>📝</span>
                    <h2 className={styles.title}>운동 피드백</h2>
                    <p className={styles.subtitle}>{exerciseName} 완료!</p>
                </div>

                {/* Step Indicator */}
                <div className={styles.stepIndicator}>
                    <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`}>1</div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`}>2</div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.stepDot} ${step >= 3 ? styles.active : ''}`}>3</div>
                </div>

                {/* Step 1: RPE */}
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <h3 className={styles.question}>
                            이 운동이 얼마나 힘드셨나요?
                        </h3>
                        <p className={styles.questionSub}>
                            운동 자각도(RPE)를 선택해주세요
                        </p>

                        <div className={styles.rpeContainer}>
                            <div
                                className={styles.rpeValue}
                                style={{ color: getRpeColor(feedback.rpe) }}
                            >
                                {feedback.rpe}
                            </div>
                            <div className={styles.rpeLabel}>
                                {rpeDescriptions[feedback.rpe]}
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={feedback.rpe}
                                onChange={(e) => setFeedback(prev => ({ ...prev, rpe: Number(e.target.value) }))}
                                className={styles.rpeSlider}
                                style={{
                                    background: `linear-gradient(to right, #4CAF50, #FF9800, #F44336)`
                                }}
                            />
                            <div className={styles.rpeScale}>
                                <span>쉬움</span>
                                <span>보통</span>
                                <span>힘듦</span>
                            </div>
                        </div>

                        <div className={styles.difficultyBtns}>
                            <button
                                className={`${styles.diffBtn} ${feedback.difficulty === 'easy' ? styles.selected : ''}`}
                                onClick={() => setFeedback(prev => ({ ...prev, difficulty: 'easy' }))}
                            >
                                😊 더 쉽게 해도 돼요
                            </button>
                            <button
                                className={`${styles.diffBtn} ${feedback.difficulty === 'just_right' ? styles.selected : ''}`}
                                onClick={() => setFeedback(prev => ({ ...prev, difficulty: 'just_right' }))}
                            >
                                👍 적당해요
                            </button>
                            <button
                                className={`${styles.diffBtn} ${feedback.difficulty === 'hard' ? styles.selected : ''}`}
                                onClick={() => setFeedback(prev => ({ ...prev, difficulty: 'hard' }))}
                            >
                                😓 좀 힘들었어요
                            </button>
                        </div>

                        <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={() => setStep(2)}
                        >
                            다음
                        </button>
                    </div>
                )}

                {/* Step 2: Pain Area */}
                {step === 2 && (
                    <div className={styles.stepContent}>
                        <h3 className={styles.question}>
                            운동 중 아픈 부위가 있었나요?
                        </h3>
                        <p className={styles.questionSub}>
                            통증이 있었던 부위를 터치해주세요
                        </p>

                        <div className={styles.bodyMapContainer}>
                            <div className={styles.bodyMap}>
                                {/* Body Silhouette SVG */}
                                <svg viewBox="0 0 100 200" className={styles.bodySvg}>
                                    {/* Head */}
                                    <circle cx="50" cy="15" r="12" fill="#E0E0E0" />
                                    {/* Body */}
                                    <ellipse cx="50" cy="55" rx="20" ry="28" fill="#E0E0E0" />
                                    {/* Left Arm */}
                                    <ellipse cx="25" cy="50" rx="6" ry="25" fill="#E0E0E0" />
                                    {/* Right Arm */}
                                    <ellipse cx="75" cy="50" rx="6" ry="25" fill="#E0E0E0" />
                                    {/* Left Leg */}
                                    <ellipse cx="40" cy="130" rx="8" ry="45" fill="#E0E0E0" />
                                    {/* Right Leg */}
                                    <ellipse cx="60" cy="130" rx="8" ry="45" fill="#E0E0E0" />
                                </svg>

                                {/* Pain Points */}
                                {bodyParts.map((part) => (
                                    <button
                                        key={part.id}
                                        className={`${styles.painPoint} ${feedback.painAreas.includes(part.id) ? styles.selected : ''}`}
                                        style={{ top: `${part.top}%`, left: `${part.left}%` }}
                                        onClick={() => handlePainAreaToggle(part.id)}
                                        title={part.label}
                                    />
                                ))}
                            </div>

                            {feedback.painAreas.length > 0 && (
                                <div className={styles.selectedParts}>
                                    {feedback.painAreas.map(areaId => {
                                        const part = bodyParts.find(p => p.id === areaId);
                                        return (
                                            <span key={areaId} className={styles.painTag}>
                                                {part?.label}
                                                <button onClick={() => handlePainAreaToggle(areaId)}>×</button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button
                            className={`${styles.noPainBtn} ${feedback.painAreas.length === 0 ? styles.selected : ''}`}
                            onClick={() => setFeedback(prev => ({ ...prev, painAreas: [] }))}
                        >
                            😊 통증 없었어요!
                        </button>

                        {feedback.painAreas.length > 0 && (
                            <div className={styles.painLevelSection}>
                                <label>통증 정도</label>
                                <div className={styles.painLevelBtns}>
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <button
                                            key={level}
                                            className={`${styles.painLevelBtn} ${feedback.painLevel === level ? styles.selected : ''}`}
                                            onClick={() => setFeedback(prev => ({ ...prev, painLevel: level }))}
                                        >
                                            {level === 1 && '😐'}
                                            {level === 2 && '😕'}
                                            {level === 3 && '😣'}
                                            {level === 4 && '😖'}
                                            {level === 5 && '😭'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.buttonRow}>
                            <button className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>
                                이전
                            </button>
                            <button className="btn btn-primary btn-lg flex-1" onClick={() => setStep(3)}>
                                다음
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className={styles.stepContent}>
                        <div className={styles.confirmIcon}>🎉</div>
                        <h3 className={styles.confirmTitle}>피드백 감사합니다!</h3>
                        <p className={styles.confirmText}>
                            입력하신 정보를 바탕으로<br />
                            <strong>내일 운동 강도가 자동 조정</strong>됩니다.
                        </p>

                        <div className={styles.feedbackSummary}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>운동 자각도</span>
                                <span className={styles.summaryValue} style={{ color: getRpeColor(feedback.rpe) }}>
                                    {feedback.rpe}/10 ({rpeDescriptions[feedback.rpe]})
                                </span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>난이도 평가</span>
                                <span className={styles.summaryValue}>
                                    {feedback.difficulty === 'easy' && '더 쉽게 해도 됨'}
                                    {feedback.difficulty === 'just_right' && '적당함'}
                                    {feedback.difficulty === 'hard' && '좀 힘들었음'}
                                </span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>통증 부위</span>
                                <span className={styles.summaryValue}>
                                    {feedback.painAreas.length > 0
                                        ? feedback.painAreas.map(id => bodyParts.find(p => p.id === id)?.label).join(', ')
                                        : '없음'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.aiNote}>
                            <span className={styles.aiIcon}>🤖</span>
                            <p>AI가 피드백을 분석하여 맞춤 운동을 준비합니다</p>
                        </div>

                        <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={handleSubmit}
                        >
                            완료
                        </button>
                    </div>
                )}

                {/* Close Button */}
                <button className={styles.closeBtn} onClick={onClose}>×</button>
            </div>
        </div>
    );
}
