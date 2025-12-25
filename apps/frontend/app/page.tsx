'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import ExerciseSession from '@/components/ExerciseSession';
import NutritionTracker from '@/components/NutritionTracker';
import { supabase } from '@/lib/supabase';

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

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push('/login');
                return;
            }

            // 프로필 정보 가져오기
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', authUser.id)
                .single();

            setUser({
                name: profile?.name || authUser.email?.split('@')[0] || '사용자',
                isLoading: false,
            });
        } catch (error) {
            console.error('Auth check error:', error);
            router.push('/login');
        }
    };

    const [todayExercises, setTodayExercises] = useState<TodayExercise[]>([
        { id: 1, name: '스쿼트', type: '무산소', sets: 3, reps: '12회', intensity: 6, completed: true },
        { id: 2, name: '런지', type: '무산소', sets: 3, reps: '10회', intensity: 7, completed: true },
        { id: 3, name: '플랭크', type: '무산소', sets: 3, reps: '30초', intensity: 8, completed: false },
        { id: 4, name: '스트레칭', type: '스트레칭', sets: 1, reps: '15초', intensity: 2, completed: false },
    ]);

    const [activeSession, setActiveSession] = useState<TodayExercise | null>(null);

    const healthSummary = {
        sppbScore: 9,
        maxSppb: 12,
        weeklyProgress: 75,
        streak: 5,
    };

    const [showNutrition, setShowNutrition] = useState(false);

    // 처방 근거 (AI 분석 결과 기반)
    const prescriptionReason = {
        mainReason: '하지 근력 강화',
        details: '평가 결과 하지 근기능이 다소 부족하여 스쿼트, 런지 등 하지 운동을 우선 배치했습니다.',
        considerations: ['관절 상태 양호', '균형 능력 정상'],
    };

    // Dr. 노리 맞춤 메시지 (사용자 상태 기반)
    const getCoachMessage = () => {
        const completedPercent = Math.round((completedCount / todayExercises.length) * 100);
        if (completedPercent === 100) {
            return `${user.name}님, 오늘 운동을 모두 완료하셨네요! 🎉 내일도 이 컨디션 유지해봐요!`;
        } else if (completedPercent >= 50) {
            return `${user.name}님, 벌써 절반 이상 하셨어요! 💪 ${prescriptionReason.mainReason}에 집중해서 마무리해봐요.`;
        } else if (healthSummary.streak >= 5) {
            return `${user.name}님, ${healthSummary.streak}일 연속 운동 중이시네요! 꾸준함이 정말 대단해요. 오늘 ${prescriptionReason.mainReason} 운동으로 시작해볼까요?`;
        } else {
            return `${user.name}님, 오늘은 ${prescriptionReason.mainReason}을 위한 운동을 준비했어요. 관절에 무리 없이 천천히 시작해보세요!`;
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

            {/* Coach Profile - Human Touch */}
            <section className={`card ${styles.coachCard} mt-5`}>
                <div className={styles.coachProfile}>
                    <div className={styles.coachAvatar}>
                        <Image
                            src="/dr-nori.jpg"
                            alt="Dr. 노리"
                            width={56}
                            height={56}
                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
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

            {/* Progress Card */}
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
                            <path
                                className={styles.circleBg}
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={styles.circle}
                                strokeDasharray={`${(completedCount / todayExercises.length) * 100}, 100`}
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <span className={styles.progressPercent}>
                            {Math.round((completedCount / todayExercises.length) * 100)}%
                        </span>
                    </div>
                </div>
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>🔥</span>
                        <span className={styles.statValue}>{healthSummary.streak}일</span>
                        <span className={styles.statLabel}>연속</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>📊</span>
                        <span className={styles.statValue}>{healthSummary.sppbScore}점</span>
                        <span className={styles.statLabel}>SPPB</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>📈</span>
                        <span className={styles.statValue}>{healthSummary.weeklyProgress}%</span>
                        <span className={styles.statLabel}>주간</span>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className={`${styles.quickActions} mt-5`}>
                <Link href="/assessment" className={`card ${styles.actionCard}`}>
                    <span className={styles.actionIcon}>📋</span>
                    <span className={styles.actionLabel}>건강 평가</span>
                </Link>
                <Link href="/exercise" className={`card ${styles.actionCard}`}>
                    <span className={styles.actionIcon}>🏋️</span>
                    <span className={styles.actionLabel}>운동 처방</span>
                </Link>
            </section>

            {/* Today's Exercises */}
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

                {/* Prescription Reasoning - Why */}
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

            {/* Nutrition Quick Check */}
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
                    <span className={styles.proteinMore}>+6</span>
                </div>
            </section>

            {/* Motivation Banner */}
            <section className={`card ${styles.motivationBanner} mt-6`}>
                <div className={styles.motivationContent}>
                    <p className={styles.motivationText}>
                        "꾸준함이 실력이 됩니다"
                    </p>
                    <p className="caption mt-2">조금씩 매일 해보세요!</p>
                </div>
                <span className={styles.motivationEmoji}>💪</span>
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
