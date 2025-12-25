'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ExercisePrescription } from '@/lib/exercisePrescription';
import styles from './page.module.css';

export default function PrescriptionResultPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [prescription, setPrescription] = useState<ExercisePrescription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'exercises'>('overview');

    useEffect(() => {
        loadPrescription();
    }, []);

    const loadPrescription = async () => {
        try {
            // Try to get from URL params or localStorage
            const prescriptionData = searchParams.get('data');
            if (prescriptionData) {
                setPrescription(JSON.parse(decodeURIComponent(prescriptionData)));
            } else {
                // Try localStorage
                const stored = localStorage.getItem('lastPrescription');
                if (stored) {
                    setPrescription(JSON.parse(stored));
                }
            }
        } catch (error) {
            console.error('Error loading prescription:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskCategoryLabel = (category: string) => {
        switch (category) {
            case 'normal': return '정상';
            case 'prefrail': return '전노쇠';
            case 'frail': return '노쇠';
            default: return category;
        }
    };

    const getRiskCategoryColor = (category: string) => {
        switch (category) {
            case 'normal': return '#4CAF50';
            case 'prefrail': return '#FF9800';
            case 'frail': return '#f44336';
            default: return '#666';
        }
    };

    const getIntensityLabel = (intensity: string) => {
        switch (intensity) {
            case 'low': return '저강도';
            case 'moderate': return '중강도';
            case 'vigorous': return '고강도';
            default: return intensity;
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>불러오는 중...</div>
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <p>운동 처방 결과가 없습니다.</p>
                    <button
                        className={styles.primaryBtn}
                        onClick={() => router.push('/assessment')}
                    >
                        평가 시작하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/exercise')}>
                    ← 뒤로
                </button>
                <h1 className={styles.title}>맞춤 운동 처방</h1>
            </div>

            {/* Risk Category Badge */}
            <div className={styles.riskBadge} style={{ backgroundColor: getRiskCategoryColor(prescription.riskCategory) }}>
                <span className={styles.riskLabel}>건강 상태</span>
                <span className={styles.riskValue}>{getRiskCategoryLabel(prescription.riskCategory)}</span>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 요약
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'weekly' ? styles.active : ''}`}
                    onClick={() => setActiveTab('weekly')}
                >
                    📅 주간 계획
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'exercises' ? styles.active : ''}`}
                    onClick={() => setActiveTab('exercises')}
                >
                    🏋️ 운동 목록
                </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div className={styles.overview}>
                        {/* Aerobic */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIcon}>🏃</span>
                                <h3>유산소 운동</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>주간 목표</span>
                                    <span className={styles.statValue}>{prescription.aerobic.minutesPerWeek}분</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>빈도</span>
                                    <span className={styles.statValue}>주 {prescription.aerobic.frequency}회</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>강도</span>
                                    <span className={styles.statValue}>{getIntensityLabel(prescription.aerobic.intensity)} (RPE {prescription.aerobic.rpeRange[0]}-{prescription.aerobic.rpeRange[1]})</span>
                                </div>
                                <div className={styles.examples}>
                                    <span className={styles.exampleLabel}>추천 운동:</span>
                                    <span>{prescription.aerobic.examples.join(', ')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Resistance */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIcon}>💪</span>
                                <h3>근력 운동</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>빈도</span>
                                    <span className={styles.statValue}>주 {prescription.resistance.daysPerWeek}회</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>세트/반복</span>
                                    <span className={styles.statValue}>{prescription.resistance.sets}세트 × {prescription.resistance.reps[0]}-{prescription.resistance.reps[1]}회</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>강도</span>
                                    <span className={styles.statValue}>{prescription.resistance.intensityPercent[0]}-{prescription.resistance.intensityPercent[1]}% (RPE {prescription.resistance.rpeRange[0]}-{prescription.resistance.rpeRange[1]})</span>
                                </div>
                            </div>
                        </div>

                        {/* Balance (if applicable) */}
                        {prescription.balance && (
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardIcon}>⚖️</span>
                                    <h3>균형 운동</h3>
                                    <span className={styles.required}>필수</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>빈도</span>
                                        <span className={styles.statValue}>주 {prescription.balance.daysPerWeek}회</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>시간</span>
                                        <span className={styles.statValue}>{prescription.balance.duration}분</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Precautions */}
                        {prescription.precautions.length > 0 && (
                            <div className={`${styles.card} ${styles.warning}`}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardIcon}>⚠️</span>
                                    <h3>주의사항</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <ul className={styles.precautionList}>
                                        {prescription.precautions.map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'weekly' && (
                    <div className={styles.weeklyPlan}>
                        {Object.entries(prescription.weeklyPlan).map(([day, plan]) => (
                            <div key={day} className={`${styles.dayCard} ${styles[plan.type]}`}>
                                <div className={styles.dayHeader}>
                                    <span className={styles.dayName}>
                                        {day === 'monday' && '월요일'}
                                        {day === 'tuesday' && '화요일'}
                                        {day === 'wednesday' && '수요일'}
                                        {day === 'thursday' && '목요일'}
                                        {day === 'friday' && '금요일'}
                                        {day === 'saturday' && '토요일'}
                                        {day === 'sunday' && '일요일'}
                                    </span>
                                    <span className={styles.dayType}>
                                        {plan.type === 'rest' && '🛋️ 휴식'}
                                        {plan.type === 'aerobic' && '🏃 유산소'}
                                        {plan.type === 'resistance' && '💪 근력'}
                                        {plan.type === 'combined' && '🔄 복합'}
                                    </span>
                                </div>
                                <div className={styles.dayBody}>
                                    {plan.duration > 0 && (
                                        <span className={styles.dayDuration}>{plan.duration}분</span>
                                    )}
                                    <ul className={styles.dayExercises}>
                                        {plan.exercises.map((ex: string, i: number) => (
                                            <li key={i}>{ex}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'exercises' && (
                    <div className={styles.exerciseList}>
                        <h3 className={styles.sectionTitle}>근력 운동 ({prescription.resistance.exercises.length}개)</h3>
                        {prescription.resistance.exercises.map((ex, i) => (
                            <div key={ex.id} className={styles.exerciseCard}>
                                <div className={styles.exerciseNum}>{i + 1}</div>
                                <div className={styles.exerciseInfo}>
                                    <span className={styles.exerciseName}>{ex.name}</span>
                                    <span className={styles.exerciseDesc}>{ex.description}</span>
                                </div>
                            </div>
                        ))}

                        {prescription.balance && (
                            <>
                                <h3 className={styles.sectionTitle}>균형 운동 ({prescription.balance.exercises.length}개)</h3>
                                {prescription.balance.exercises.map((ex, i) => (
                                    <div key={ex.id} className={styles.exerciseCard}>
                                        <div className={styles.exerciseNum}>{i + 1}</div>
                                        <div className={styles.exerciseInfo}>
                                            <span className={styles.exerciseName}>{ex.name}</span>
                                            <span className={styles.exerciseDesc}>{ex.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        <h3 className={styles.sectionTitle}>유연성 운동 ({prescription.flexibility.exercises.length}개)</h3>
                        {prescription.flexibility.exercises.map((ex, i) => (
                            <div key={ex.id} className={styles.exerciseCard}>
                                <div className={styles.exerciseNum}>{i + 1}</div>
                                <div className={styles.exerciseInfo}>
                                    <span className={styles.exerciseName}>{ex.name}</span>
                                    <span className={styles.exerciseDesc}>{ex.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Start Exercise Button */}
            <div className={styles.footer}>
                <button
                    className={styles.startBtn}
                    onClick={() => router.push('/exercise')}
                >
                    🏋️ 오늘 운동 시작하기
                </button>
            </div>
        </div>
    );
}
