'use client';

import { useState } from 'react';
import styles from './page.module.css';

type Category = 'ALL' | 'STRENGTH' | 'AEROBIC' | 'FLEXIBILITY' | 'BALANCE';

interface Exercise {
    id: number;
    name: string;
    category: Category;
    intensity: number;
    sets: number;
    reps: number;
    duration?: number;
    videoUrl?: string;
    description: string;
    caution?: string;
}

const mockExercises: Exercise[] = [
    {
        id: 1,
        name: '스쿼트',
        category: 'STRENGTH',
        intensity: 6,
        sets: 3,
        reps: 12,
        description: '하체 근력 강화에 효과적인 기본 운동',
        caution: '무릎이 발끝을 넘지 않도록 주의'
    },
    {
        id: 2,
        name: '런지',
        category: 'STRENGTH',
        intensity: 5,
        sets: 3,
        reps: 10,
        description: '하체 균형과 근력을 동시에 강화',
    },
    {
        id: 3,
        name: '플랭크',
        category: 'STRENGTH',
        intensity: 7,
        sets: 3,
        reps: 30,
        description: '코어 근육 강화에 최적의 운동',
        caution: '허리가 처지지 않도록 유지'
    },
    {
        id: 4,
        name: '제자리 걷기',
        category: 'AEROBIC',
        intensity: 3,
        sets: 1,
        reps: 1,
        duration: 10,
        description: '가벼운 유산소 운동으로 심폐 기능 향상',
    },
    {
        id: 5,
        name: '팔 스트레칭',
        category: 'FLEXIBILITY',
        intensity: 2,
        sets: 2,
        reps: 15,
        description: '어깨와 팔 근육의 유연성 향상',
    },
    {
        id: 6,
        name: '다리 스트레칭',
        category: 'FLEXIBILITY',
        intensity: 2,
        sets: 2,
        reps: 15,
        description: '하체 유연성과 관절 가동범위 개선',
    },
    {
        id: 7,
        name: '한 발 서기',
        category: 'BALANCE',
        intensity: 4,
        sets: 3,
        reps: 30,
        description: '균형 감각과 하체 안정성 향상',
        caution: '넘어지지 않도록 지지대 근처에서 수행'
    },
    {
        id: 8,
        name: '발뒤꿈치 들기',
        category: 'BALANCE',
        intensity: 3,
        sets: 3,
        reps: 15,
        description: '종아리 근력과 균형 감각 강화',
    },
];

const categories = [
    { key: 'ALL', label: '전체', icon: '🏃' },
    { key: 'STRENGTH', label: '근력', icon: '💪' },
    { key: 'AEROBIC', label: '유산소', icon: '❤️' },
    { key: 'FLEXIBILITY', label: '유연성', icon: '🧘' },
    { key: 'BALANCE', label: '균형', icon: '⚖️' },
];

export default function ExercisePage() {
    const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    const filteredExercises = selectedCategory === 'ALL'
        ? mockExercises
        : mockExercises.filter(e => e.category === selectedCategory);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'STRENGTH': return 'var(--blue-500)';
            case 'AEROBIC': return 'var(--red-500)';
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

    const getIntensityLabel = (intensity: number) => {
        if (intensity <= 3) return { label: '낮음', color: 'var(--color-success)' };
        if (intensity <= 6) return { label: '보통', color: 'var(--color-warning)' };
        return { label: '높음', color: 'var(--color-error)' };
    };

    return (
        <div className="container animate-fade-in">
            {/* Header Section */}
            <section className={styles.header}>
                <h2 className="headline">맞춤 운동 처방</h2>
                <p className="caption mt-2">AI가 분석한 당신을 위한 운동이에요</p>
            </section>

            {/* Category Filter */}
            <section className={styles.categoryFilter}>
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        className={`${styles.categoryBtn} ${selectedCategory === cat.key ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(cat.key as Category)}
                    >
                        <span className={styles.categoryIcon}>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </section>

            {/* Exercise Count */}
            <div className={styles.countInfo}>
                <span className="caption">총 {filteredExercises.length}개의 운동</span>
            </div>

            {/* Exercise List */}
            <section className={styles.exerciseList}>
                {filteredExercises.map((exercise) => {
                    const intensity = getIntensityLabel(exercise.intensity);
                    return (
                        <div
                            key={exercise.id}
                            className={`card ${styles.exerciseCard}`}
                            onClick={() => setSelectedExercise(exercise)}
                        >
                            <div className={styles.exerciseHeader}>
                                <div
                                    className={styles.categoryBadge}
                                    style={{ backgroundColor: getCategoryColor(exercise.category) }}
                                >
                                    {getCategoryLabel(exercise.category)}
                                </div>
                                <div
                                    className={styles.intensityBadge}
                                    style={{ color: intensity.color }}
                                >
                                    강도: {intensity.label}
                                </div>
                            </div>

                            <h3 className={styles.exerciseName}>{exercise.name}</h3>
                            <p className={styles.exerciseDesc}>{exercise.description}</p>

                            <div className={styles.exerciseInfo}>
                                <span className={styles.infoItem}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                        <polyline points="16 6 12 2 8 6" />
                                        <line x1="12" y1="2" x2="12" y2="15" />
                                    </svg>
                                    {exercise.sets}세트
                                </span>
                                <span className={styles.infoItem}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {exercise.duration ? `${exercise.duration}분` : `${exercise.reps}회`}
                                </span>
                            </div>

                            {exercise.caution && (
                                <div className={styles.cautionBadge}>
                                    ⚠️ {exercise.caution}
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className={styles.modalOverlay} onClick={() => setSelectedExercise(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button
                            className={styles.modalClose}
                            onClick={() => setSelectedExercise(null)}
                        >
                            ✕
                        </button>

                        <div
                            className={styles.modalCategory}
                            style={{ backgroundColor: getCategoryColor(selectedExercise.category) }}
                        >
                            {getCategoryLabel(selectedExercise.category)}
                        </div>

                        <h2 className={styles.modalTitle}>{selectedExercise.name}</h2>
                        <p className="caption">{selectedExercise.description}</p>

                        <div className={styles.modalStats}>
                            <div className={styles.modalStatItem}>
                                <span className={styles.modalStatLabel}>세트</span>
                                <span className={styles.modalStatValue}>{selectedExercise.sets}</span>
                            </div>
                            <div className={styles.modalStatItem}>
                                <span className={styles.modalStatLabel}>
                                    {selectedExercise.duration ? '시간' : '반복'}
                                </span>
                                <span className={styles.modalStatValue}>
                                    {selectedExercise.duration ? `${selectedExercise.duration}분` : `${selectedExercise.reps}회`}
                                </span>
                            </div>
                            <div className={styles.modalStatItem}>
                                <span className={styles.modalStatLabel}>강도</span>
                                <span
                                    className={styles.modalStatValue}
                                    style={{ color: getIntensityLabel(selectedExercise.intensity).color }}
                                >
                                    {selectedExercise.intensity}/10
                                </span>
                            </div>
                        </div>

                        {selectedExercise.caution && (
                            <div className={styles.modalCaution}>
                                <span className={styles.cautionIcon}>⚠️</span>
                                <div>
                                    <strong>주의사항</strong>
                                    <p>{selectedExercise.caution}</p>
                                </div>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button className="btn btn-primary btn-lg btn-block">
                                운동 시작하기
                            </button>
                            <button
                                className="btn btn-ghost btn-block"
                                onClick={() => setSelectedExercise(null)}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
