'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
    // Mock data - in production, this would come from API
    const user = {
        name: '김지현',
        completedToday: 2,
        totalToday: 4,
    };

    const todayExercises = [
        { id: 1, name: '스쿼트', sets: 3, reps: 12, category: 'STRENGTH', completed: true },
        { id: 2, name: '런지', sets: 3, reps: 10, category: 'STRENGTH', completed: true },
        { id: 3, name: '플랭크', sets: 3, reps: 30, category: 'STRENGTH', completed: false },
        { id: 4, name: '스트레칭', sets: 1, reps: 15, category: 'FLEXIBILITY', completed: false },
    ];

    const healthSummary = {
        sppbScore: 9,
        maxSppb: 12,
        weeklyProgress: 75,
        streak: 5,
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'STRENGTH': return 'var(--blue-500)';
            case 'AEROBIC': return 'var(--green-500)';
            case 'FLEXIBILITY': return 'var(--orange-500)';
            case 'BALANCE': return 'var(--teal-500)';
            default: return 'var(--grey-500)';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'STRENGTH': return '근력';
            case 'AEROBIC': return '유산소';
            case 'FLEXIBILITY': return '유연성';
            case 'BALANCE': return '균형';
            default: return category;
        }
    };

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

            {/* Progress Card */}
            <section className={`card ${styles.progressCard} mt-5`}>
                <div className={styles.progressHeader}>
                    <div>
                        <p className="caption">오늘의 진행도</p>
                        <p className={styles.progressValue}>
                            <span className={styles.progressCurrent}>{user.completedToday}</span>
                            <span className={styles.progressTotal}>/ {user.totalToday}</span>
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
                                strokeDasharray={`${(user.completedToday / user.totalToday) * 100}, 100`}
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <span className={styles.progressPercent}>
                            {Math.round((user.completedToday / user.totalToday) * 100)}%
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
                <div className={styles.exerciseList}>
                    {todayExercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className={`card ${styles.exerciseItem} ${exercise.completed ? styles.completed : ''}`}
                        >
                            <div
                                className={styles.exerciseBadge}
                                style={{ backgroundColor: getCategoryColor(exercise.category) }}
                            >
                                {getCategoryLabel(exercise.category)}
                            </div>
                            <div className={styles.exerciseInfo}>
                                <h4 className={styles.exerciseName}>{exercise.name}</h4>
                                <p className="caption">{exercise.sets}세트 × {exercise.reps}회</p>
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
        </div>
    );
}
