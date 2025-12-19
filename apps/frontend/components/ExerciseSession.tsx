'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './ExerciseSession.module.css';

interface Exercise {
    id: number;
    name: string;
    type: string;
    sets: number;
    reps: string;
    intensity: number;
    caution?: string;
}

interface ExerciseSessionProps {
    exercise: Exercise;
    onComplete: () => void;
    onClose: () => void;
}

type SessionPhase = 'ready' | 'exercise' | 'rest' | 'complete';

export default function ExerciseSession({ exercise, onComplete, onClose }: ExerciseSessionProps) {
    const [currentSet, setCurrentSet] = useState(1);
    const [phase, setPhase] = useState<SessionPhase>('ready');
    const [timeLeft, setTimeLeft] = useState(3); // 준비 시간
    const [isPaused, setIsPaused] = useState(false);

    // reps에서 시간/횟수 파싱
    const parseReps = useCallback(() => {
        const reps = exercise.reps;
        if (reps.includes('분')) {
            const minutes = parseInt(reps);
            return { type: 'time', value: minutes * 60 };
        } else if (reps.includes('초')) {
            const seconds = parseInt(reps);
            return { type: 'time', value: seconds };
        } else {
            const count = parseInt(reps);
            return { type: 'count', value: count };
        }
    }, [exercise.reps]);

    const repsInfo = parseReps();
    const restTime = 30; // 세트 사이 휴식 시간 (초)

    // 타이머 로직
    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // 시간 종료
                    if (phase === 'ready') {
                        // 운동 시작
                        setPhase('exercise');
                        return repsInfo.type === 'time' ? repsInfo.value : 0;
                    } else if (phase === 'exercise' && repsInfo.type === 'time') {
                        // 운동 완료 -> 휴식 또는 완료
                        if (currentSet < exercise.sets) {
                            setPhase('rest');
                            return restTime;
                        } else {
                            setPhase('complete');
                            return 0;
                        }
                    } else if (phase === 'rest') {
                        // 휴식 완료 -> 다음 세트
                        setCurrentSet((s) => s + 1);
                        setPhase('exercise');
                        return repsInfo.type === 'time' ? repsInfo.value : 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, isPaused, currentSet, exercise.sets, repsInfo, restTime]);

    // 횟수 기반 운동 완료 처리
    const handleRepComplete = () => {
        if (currentSet < exercise.sets) {
            setPhase('rest');
            setTimeLeft(restTime);
        } else {
            setPhase('complete');
        }
    };

    // 다음 세트로 건너뛰기
    const skipRest = () => {
        setCurrentSet((s) => s + 1);
        setPhase('exercise');
        setTimeLeft(repsInfo.type === 'time' ? repsInfo.value : 0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'ready': return '준비하세요!';
            case 'exercise': return '운동 중';
            case 'rest': return '휴식';
            case 'complete': return '완료!';
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'ready': return 'var(--orange-500)';
            case 'exercise': return 'var(--blue-500)';
            case 'rest': return 'var(--teal-500)';
            case 'complete': return 'var(--color-success)';
        }
    };

    if (phase === 'complete') {
        return (
            <div className={styles.overlay}>
                <div className={styles.container}>
                    <div className={styles.completeScreen}>
                        <div className={styles.completeIcon}>🎉</div>
                        <h2 className={styles.completeTitle}>운동 완료!</h2>
                        <p className={styles.completeText}>
                            {exercise.name} {exercise.sets}세트를 완료했습니다!
                        </p>
                        <div className={styles.completeStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{exercise.sets}</span>
                                <span className={styles.statLabel}>세트</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{exercise.reps}</span>
                                <span className={styles.statLabel}>매회</span>
                            </div>
                        </div>
                        <button className={`btn btn-primary btn-lg ${styles.completeBtn}`} onClick={onComplete}>
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                    <div className={styles.setIndicator}>
                        {currentSet} / {exercise.sets} 세트
                    </div>
                    <div style={{ width: 40 }} />
                </div>

                {/* 운동 정보 */}
                <div className={styles.exerciseInfo}>
                    <h2 className={styles.exerciseName}>{exercise.name}</h2>
                    <span className={styles.exerciseType}>{exercise.type}</span>
                </div>

                {/* 메인 디스플레이 */}
                <div className={styles.mainDisplay}>
                    <div className={styles.phaseLabel} style={{ color: getPhaseColor() }}>
                        {getPhaseText()}
                    </div>

                    {(phase === 'ready' || phase === 'rest' || repsInfo.type === 'time') && (
                        <div className={styles.timerCircle} style={{ borderColor: getPhaseColor() }}>
                            <span className={styles.timerText}>{formatTime(timeLeft)}</span>
                        </div>
                    )}

                    {phase === 'exercise' && repsInfo.type === 'count' && (
                        <div className={styles.repDisplay}>
                            <div className={styles.repCount}>{repsInfo.value}회</div>
                            <p className={styles.repHint}>완료하면 버튼을 눌러주세요</p>
                        </div>
                    )}
                </div>

                {/* 진행 바 */}
                <div className={styles.progressBar}>
                    {Array.from({ length: exercise.sets }, (_, i) => (
                        <div
                            key={i}
                            className={`${styles.progressDot} ${i < currentSet ? styles.completed : ''} ${i === currentSet - 1 && phase === 'exercise' ? styles.active : ''}`}
                        />
                    ))}
                </div>

                {/* 주의사항 */}
                {exercise.caution && (
                    <div className={styles.caution}>
                        ⚠️ {exercise.caution}
                    </div>
                )}

                {/* 컨트롤 버튼 */}
                <div className={styles.controls}>
                    {phase === 'exercise' && repsInfo.type === 'count' && (
                        <button className={`btn btn-primary btn-lg ${styles.mainBtn}`} onClick={handleRepComplete}>
                            세트 완료 ✓
                        </button>
                    )}

                    {phase === 'rest' && (
                        <button className={`btn btn-primary btn-lg ${styles.mainBtn}`} onClick={skipRest}>
                            휴식 건너뛰기 →
                        </button>
                    )}

                    {(phase === 'exercise' && repsInfo.type === 'time') && (
                        <button
                            className={`btn ${isPaused ? 'btn-primary' : 'btn-ghost'} btn-lg ${styles.mainBtn}`}
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? '▶ 계속하기' : '⏸ 일시정지'}
                        </button>
                    )}

                    <button className={`btn btn-ghost ${styles.skipBtn}`} onClick={onClose}>
                        운동 그만하기
                    </button>
                </div>
            </div>
        </div>
    );
}
