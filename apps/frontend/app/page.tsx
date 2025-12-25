'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import ExerciseSession from '@/components/ExerciseSession';
import NutritionTracker from '@/components/NutritionTracker';
import { supabase } from '@/lib/supabase';
import { ExercisePrescription } from '@/lib/exercisePrescription';

interface TodayExercise {
    id: number;
    name: string;
    type: string;
    sets: number;
    reps: string;
    intensity: number;
    completed: boolean;
}

interface UserInfo {
    name: string;
    isLoading: boolean;
}

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<UserInfo>({ name: '사용자', isLoading: true });
    const [todayExercises, setTodayExercises] = useState<TodayExercise[]>([]);
    const [hasPrescription, setHasPrescription] = useState(false);
    const [activeSession, setActiveSession] = useState<TodayExercise | null>(null);
    const [streak, setStreak] = useState(0);

    // 처방 근거 (AI 분석 결과 기반 - 기본값)
    const [prescriptionReason, setPrescriptionReason] = useState({
        mainReason: '건강 증진',
        details: '꾸준한 운동으로 활력을 되찾아보세요.',
    });

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push('/login');
                return;
            }

            // 1. 프로필 정보 로딩
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', authUser.id)
                .single();

            setUser({
                name: profile?.name || authUser.email?.split('@')[0] || '사용자',
                isLoading: false,
            });

            // 2. 처방 정보 확인 (localStorage)
            const storedPrescription = localStorage.getItem('lastPrescription');
            if (storedPrescription) {
                setHasPrescription(true);
                const prescription: ExercisePrescription = JSON.parse(storedPrescription);

                // 처방 근거 설정
                if (prescription.riskLevel === 'frail') {
                    setPrescriptionReason({
                        mainReason: '기초 체력 회복',
                        details: '관절에 무리가 가지 않는 안전한 운동으로 구성했습니다.',
                    });
                } else if (prescription.riskLevel === 'pre-frail') {
                    setPrescriptionReason({
                        mainReason: '근력 강화',
                        details: '일상 생활을 더 활기차게 보낼 수 있도록 근력을 키워봐요.',
                    });
                } else {
                    setPrescriptionReason({
                        mainReason: '체력 증진',
                        details: '더 건강하고 활기찬 노후를 위해 운동 강도를 조금 높였어요.',
                    });
                }

                // 오늘 요일 확인 및 운동 목록 생성
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                // weeklyPlan이 있는지 확인
                if (prescription.weeklyPlan) {
                    const todayPlan = prescription.weeklyPlan[today as keyof typeof prescription.weeklyPlan];

                    if (todayPlan && todayPlan.type !== 'rest') {
                        const exercises = todayPlan.exercises.map((exName, index) => ({
                            id: index + 1,
                            name: exName,
                            type: todayPlan.type === 'aerobic' ? '유산소' : (todayPlan.type === 'balance' ? '스트레칭' : '무산소'),
                            sets: 3, // 기본값
                            reps: '15회', // 기본값
                            intensity: 5, // 기본값
                            completed: false
                        }));
                        setTodayExercises(exercises);
                    } else {
                        setTodayExercises([]);
                    }
                }
            } else {
                setHasPrescription(false);
            }

        } catch (error) {
            console.error('Data loading error:', error);
            router.push('/login');
        }
    };

    const [showNutrition, setShowNutrition] = useState(false);

    const checkStreak = 5; // TODO: 실제 Streak 계산 구현 필요

    // Dr. 노리 맞춤 메시지 (사용자 상태 기반)
    const getCoachMessage = () => {
        if (!hasPrescription) return "안녕하세요! 건강 평가를 통해 맞춤 운동을 시작해보세요.";

        const completedCount = todayExercises.filter(e => e.completed).length;
        if (todayExercises.length === 0) return `${user.name}님, 오늘은 휴식일이에요. 가벼운 스트레칭은 어떠신가요?`;

        const completedPercent = Math.round((completedCount / todayExercises.length) * 100);
        if (completedPercent === 100) {
            return `${user.name}님, 오늘 운동을 모두 완료하셨네요! 🎉 내일도 이 컨디션 유지해봐요!`;
        } else if (completedPercent >= 50) {
            return `${user.name}님, 벌써 절반 이상 하셨어요! 💪 조금만 더 힘내볼까요?`;
        } else {
            return `${user.name}님, 오늘의 맞춤 운동이 준비되어 있어요. ${prescriptionReason.mainReason}을 위해 시작해볼까요?`;
        }
    };

    const getCategoryColor = (type: string) => {
        switch (type) {
            case '무산소': return 'var(--blue-500)';
            case '유산소': return 'var(--red-500)';
            case '스트레칭': return 'var(--orange-500)';
            default: return 'var(--grey-500)';
        }
    };

    const getCategoryLabel = (type: string) => {
        switch (type) {
            case '무산소': return '근력';
            case '유산소': return '유산소';
            case '스트레칭': return '스트레칭';
            default: return type;
        }
    };

    const handleStartExercise = (exercise: TodayExercise) => {
        if (!exercise.completed) {
            setActiveSession(exercise);
        }
    };

    const handleCompleteExercise = () => {
        if (activeSession) {
            setTodayExercises(prev =>
                prev.map(ex =>
                    ex.id === activeSession.id ? { ...ex, completed: true } : ex
                )
            );
            setActiveSession(null);
        }
    };

    const completedCount = todayExercises.filter(e => e.completed).length;

    // 로딩 중이면 로딩 표시
    if (user.isLoading) {
        return (
            <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <p>불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in">
            {/* Welcome Section */}
            <section className={styles.welcome}>
                <div className={styles.greeting}>
                    <h2 className="headline">안녕하세요, {user.name}님 👋</h2>
                    <p className="caption mt-1">오늘도 건강한 하루 보내세요!</p>
                </div>
                <div className={styles.date}>
                    {new Date().toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                    })}
                </div>
            </section>

            {/* Main Content Area */}
            {!hasPrescription ? (
                // New User State: Assessment Call-to-Action
                <section className={`card ${styles.onboardingCard} mt-5`}>
                    <div className={styles.onboardingContent}>
                        <div className={styles.onboardingIcon}>📋</div>
                        <h3 className={styles.onboardingTitle}>맞춤 건강 관리를 시작해볼까요?</h3>
                        <p className={styles.onboardingDesc}>
                            간단한 건강 평가를 통해<br />
                            {user.name}님에게 딱 맞는 운동을 처방해드려요.
                        </p>
                        <Link href="/assessment" className="btn btn-primary btn-block mt-4" style={{ backgroundColor: 'white', color: 'var(--color-primary)' }}>
                            건강 평가 시작하기
                        </Link>
                    </div>
                </section>
            ) : (
                // Existing User State: Dashboard
                <>
                    {/* Coach Profile */}
                    <section className={`card ${styles.coachCard} mt-5`}>
                        <div className={styles.coachProfile}>
                            <div className={styles.coachAvatar}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                    👨‍⚕️
                                </div>
                            </div>
                            <div className={styles.coachInfo}>
                                <span className={styles.coachLabel}>담당 전문의</span>
                                <span className={styles.coachName}>Dr. 노리</span>
                            </div>
                        </div>
                        <div className={styles.coachMessage}>
                            <div className={styles.messageBubble}>
                                {getCoachMessage()}
                            </div>
                        </div>
                    </section>

                    {/* Progress & Today's Exercises */}
                    {todayExercises.length > 0 ? (
                        <>
                            <section className={`card ${styles.progressCard} mt-5`}>
                                <div className={styles.progressHeader}>
                                    <div>
                                        <p className="caption">오늘의 진행도</p>
                                        <p className={styles.progressValue}>
                                            <span className={styles.progressCurrent}>{completedCount}</span>
                                            <span className={styles.progressTotal}>/ {todayExercises.length}</span>
                                        </p>
                                    </div>
                                    <div className={styles.progressCircle}>
                                        <svg viewBox="0 0 36 36" className={styles.circularChart}>
                                            <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path
                                                className={styles.circle}
                                                strokeDasharray={`${(completedCount / todayExercises.length) * 100}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <span className={styles.progressPercent}>
                                            {Math.round((completedCount / todayExercises.length) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="mt-6">
                                <div className={styles.sectionHeader}>
                                    <h3 className="title">오늘의 운동</h3>
                                    <Link href="/exercise" className={styles.viewAll}>
                                        전체보기
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className={styles.prescriptionReason}>
                                    <span className={styles.reasonIcon}>🎯</span>
                                    <div className={styles.reasonContent}>
                                        <strong>{prescriptionReason.mainReason}</strong> 목표로 구성했어요
                                        <p>{prescriptionReason.details}</p>
                                    </div>
                                </div>
                                <div className={styles.exerciseList}>
                                    {todayExercises.map((exercise) => (
                                        <div
                                            key={exercise.id}
                                            className={`card ${styles.exerciseItem} ${exercise.completed ? styles.completed : ''}`}
                                            onClick={() => handleStartExercise(exercise)}
                                        >
                                            <div
                                                className={styles.exerciseBadge}
                                                style={{ backgroundColor: getCategoryColor(exercise.type) }}
                                            >
                                                {getCategoryLabel(exercise.type)}
                                            </div>
                                            <div className={styles.exerciseInfo}>
                                                <h4 className={styles.exerciseName}>{exercise.name}</h4>
                                                <p className="caption">{exercise.sets}세트 × {exercise.reps}</p>
                                            </div>
                                            <div className={styles.exerciseStatus}>
                                                {exercise.completed ? (
                                                    <span className={styles.checkIcon}>✓</span>
                                                ) : (
                                                    <button className="btn btn-sm btn-primary">시작</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className={`card mt-5 ${styles.emptyDayCard}`}>
                            <p>오늘 처방된 운동이 없거나 휴식일입니다 🛋️</p>
                            <Link href="/exercise" className="btn btn-secondary btn-sm mt-3">
                                전체 운동 목록 보기
                            </Link>
                        </div>
                    )}
                </>
            )}

            {/* Nutrition Quick Check - Always visible */}
            <section className={`card ${styles.nutritionCard} mt-5`}>
                <div className={styles.nutritionHeader}>
                    <div>
                        <h3 className="subtitle">🥗 오늘의 단백질</h3>
                        <p className="caption">근육 유지를 위해 기록해보세요</p>
                    </div>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setShowNutrition(true)}
                    >
                        기록하기
                    </button>
                </div>
                <div className={styles.nutritionQuick}>
                    <span className={styles.proteinIcon}>🥚</span>
                    <span className={styles.proteinIcon}>🥛</span>
                    <span className={styles.proteinIcon}>🍗</span>
                    <span className={styles.proteinIcon}>🐟</span>
                    <span className={styles.proteinMore}>+</span>
                </div>
            </section>

            {/* Exercise Session Modal */}
            {activeSession && (
                <ExerciseSession
                    exercise={activeSession}
                    onComplete={handleCompleteExercise}
                    onClose={() => setActiveSession(null)}
                />
            )}

            {/* Nutrition Modal */}
            {showNutrition && (
                <div className={styles.modalOverlay}>
                    <div className={styles.nutritionModal}>
                        <button className={styles.closeModalBtn} onClick={() => setShowNutrition(false)}>×</button>
                        <NutritionTracker onClose={() => setShowNutrition(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
