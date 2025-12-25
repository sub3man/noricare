'use client';

import { useState } from 'react';
import styles from './page.module.css';
import ExerciseSession from '@/components/ExerciseSession';

type Category = 'ALL' | '스트레칭' | '무산소' | '유산소';

interface Exercise {
    id: number;
    name: string;
    type: Category;
    intensity: number;
    sets: number;
    reps: string;
    description?: string;
    caution?: string;
}

// 100개 운동 데이터
const allExercises: Exercise[] = [
    { id: 1, name: "목 천천히 좌우로 돌리기", type: "스트레칭", sets: 2, reps: "5회", intensity: 2 },
    { id: 2, name: "고개 숙여 뒷목 늘리기", type: "스트레칭", sets: 3, reps: "15초", intensity: 2 },
    { id: 3, name: "고개 뒤로 젖혀 앞목 늘리기", type: "스트레칭", sets: 3, reps: "15초", intensity: 2 },
    { id: 4, name: "어깨 으쓱하기 (슈러그)", type: "스트레칭", sets: 3, reps: "15회", intensity: 3 },
    { id: 5, name: "양팔 크게 원 그리기", type: "스트레칭", sets: 3, reps: "10회", intensity: 3 },
    { id: 6, name: "한 팔 가슴 앞으로 당기기", type: "스트레칭", sets: 3, reps: "20초", intensity: 3 },
    { id: 7, name: "등 뒤로 깍지 끼고 펴기", type: "스트레칭", sets: 3, reps: "15초", intensity: 4 },
    { id: 8, name: "양손 깍지 끼고 기지개 켜기", type: "스트레칭", sets: 3, reps: "15초", intensity: 3 },
    { id: 9, name: "옆구리 늘리기 (좌)", type: "스트레칭", sets: 3, reps: "15초", intensity: 4 },
    { id: 10, name: "옆구리 늘리기 (우)", type: "스트레칭", sets: 3, reps: "15초", intensity: 4 },
    { id: 11, name: "손목 털기", type: "스트레칭", sets: 2, reps: "20초", intensity: 1 },
    { id: 12, name: "손바닥 앞으로 당기기", type: "스트레칭", sets: 2, reps: "15초", intensity: 2 },
    { id: 13, name: "의자에 앉아 몸통 비틀기", type: "스트레칭", sets: 3, reps: "10회", intensity: 3 },
    { id: 14, name: "고양이 자세 (등 둥글게)", type: "스트레칭", sets: 3, reps: "10초", intensity: 3 },
    { id: 15, name: "소 자세 (허리 펴기)", type: "스트레칭", sets: 3, reps: "10초", intensity: 3 },
    { id: 16, name: "아기 자세 (허리 이완)", type: "스트레칭", sets: 2, reps: "30초", intensity: 1 },
    { id: 17, name: "누워서 무릎 가슴으로 당기기", type: "스트레칭", sets: 3, reps: "15초", intensity: 2 },
    { id: 18, name: "누워서 허리 비틀기", type: "스트레칭", sets: 3, reps: "15초", intensity: 3 },
    { id: 19, name: "앉아서 햄스트링 늘리기", type: "스트레칭", sets: 3, reps: "20초", intensity: 4 },
    { id: 20, name: "서서 발목 잡고 허벅지 늘리기", type: "스트레칭", sets: 3, reps: "15초", intensity: 5, caution: "균형 잡기 어려우면 벽 잡기" },
    { id: 21, name: "벽 밀며 종아리 늘리기", type: "스트레칭", sets: 3, reps: "20초", intensity: 4 },
    { id: 22, name: "발목 돌리기", type: "스트레칭", sets: 2, reps: "10회", intensity: 1 },
    { id: 23, name: "나비 자세 (골반 이완)", type: "스트레칭", sets: 3, reps: "30초", intensity: 3 },
    { id: 24, name: "코브라 자세 (복부 이완)", type: "스트레칭", sets: 3, reps: "15초", intensity: 4 },
    { id: 25, name: "서서 상체 숙이기", type: "스트레칭", sets: 3, reps: "10초", intensity: 4 },
    { id: 26, name: "견갑골 모으기", type: "스트레칭", sets: 3, reps: "10회", intensity: 3 },
    { id: 27, name: "귀 잡고 목 옆으로 당기기", type: "스트레칭", sets: 3, reps: "15초", intensity: 3 },
    { id: 28, name: "팔꿈치 잡고 팔 뒤로 넘기기", type: "스트레칭", sets: 3, reps: "15초", intensity: 4 },
    { id: 29, name: "발가락 꼼지락 거리기", type: "스트레칭", sets: 3, reps: "20회", intensity: 1 },
    { id: 30, name: "전신 기지개 켜기", type: "스트레칭", sets: 1, reps: "10초", intensity: 1 },
    { id: 31, name: "벽 짚고 푸쉬업", type: "무산소", sets: 3, reps: "12회", intensity: 5 },
    { id: 32, name: "무릎 대고 푸쉬업", type: "무산소", sets: 3, reps: "10회", intensity: 6 },
    { id: 33, name: "정자세 푸쉬업", type: "무산소", sets: 3, reps: "8회", intensity: 8, caution: "허리가 처지지 않도록 주의" },
    { id: 34, name: "의자 잡고 스쿼트", type: "무산소", sets: 3, reps: "12회", intensity: 5 },
    { id: 35, name: "맨몸 하프 스쿼트", type: "무산소", sets: 3, reps: "15회", intensity: 6 },
    { id: 36, name: "맨몸 풀 스쿼트", type: "무산소", sets: 3, reps: "12회", intensity: 7, caution: "무릎이 발끝을 넘지 않도록" },
    { id: 37, name: "와이드 스쿼트", type: "무산소", sets: 3, reps: "12회", intensity: 7 },
    { id: 38, name: "벽 기대고 버티기 (월 싯)", type: "무산소", sets: 3, reps: "30초", intensity: 6 },
    { id: 39, name: "제자리 런지 (오른발)", type: "무산소", sets: 3, reps: "10회", intensity: 7 },
    { id: 40, name: "제자리 런지 (왼발)", type: "무산소", sets: 3, reps: "10회", intensity: 7 },
    { id: 41, name: "까치발 들기 (카프레이즈)", type: "무산소", sets: 3, reps: "20회", intensity: 4 },
    { id: 42, name: "엉덩이 들기 (브릿지)", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 43, name: "한 발 들고 브릿지", type: "무산소", sets: 3, reps: "10회", intensity: 7 },
    { id: 44, name: "엎드려 다리 뒤로 차기", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 45, name: "옆으로 누워 다리 들기", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 46, name: "슈퍼맨 자세 (등 근육 강화)", type: "무산소", sets: 3, reps: "10회", intensity: 6 },
    { id: 47, name: "플랭크 (무릎 대고)", type: "무산소", sets: 3, reps: "30초", intensity: 6 },
    { id: 48, name: "플랭크 (정자세)", type: "무산소", sets: 3, reps: "30초", intensity: 8, caution: "허리가 처지지 않게 유지" },
    { id: 49, name: "버드독 (팔다리 교차 들기)", type: "무산소", sets: 3, reps: "10회", intensity: 6 },
    { id: 50, name: "데드버그 (코어 강화)", type: "무산소", sets: 3, reps: "12회", intensity: 5 },
    { id: 51, name: "윗몸 일으키기 (크런치)", type: "무산소", sets: 3, reps: "15회", intensity: 6 },
    { id: 52, name: "누워서 다리 들기", type: "무산소", sets: 3, reps: "10회", intensity: 7 },
    { id: 53, name: "의자에 앉아 무릎 펴기", type: "무산소", sets: 3, reps: "15회", intensity: 4 },
    { id: 54, name: "물병 들고 팔 굽히기 (컬)", type: "무산소", sets: 3, reps: "15회", intensity: 4 },
    { id: 55, name: "물병 들고 팔 위로 밀기", type: "무산소", sets: 3, reps: "12회", intensity: 5 },
    { id: 56, name: "밴드 잡고 양옆으로 벌리기", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 57, name: "밴드 발에 걸고 당기기", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 58, name: "사이드 런지", type: "무산소", sets: 3, reps: "10회", intensity: 7 },
    { id: 59, name: "굿모닝 (허리 강화)", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 60, name: "의자 딥스 (팔 뒤쪽)", type: "무산소", sets: 3, reps: "10회", intensity: 7 },
    { id: 61, name: "스탠딩 사이드 레그 레이즈", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 62, name: "스탠딩 백 레그 레이즈", type: "무산소", sets: 3, reps: "15회", intensity: 5 },
    { id: 63, name: "투명 의자 자세 버티기", type: "무산소", sets: 3, reps: "20초", intensity: 6 },
    { id: 64, name: "바이시클 크런치", type: "무산소", sets: 3, reps: "15회", intensity: 8 },
    { id: 65, name: "러시안 트위스트", type: "무산소", sets: 3, reps: "20회", intensity: 7 },
    { id: 66, name: "마운틴 클라이머 (느리게)", type: "무산소", sets: 3, reps: "15회", intensity: 7 },
    { id: 67, name: "배 깔고 상체 들기", type: "무산소", sets: 3, reps: "12회", intensity: 5 },
    { id: 68, name: "누워서 엉덩이 조이기", type: "무산소", sets: 3, reps: "20초", intensity: 4 },
    { id: 69, name: "계단 오르기 자세 (스텝업)", type: "무산소", sets: 3, reps: "15회", intensity: 6 },
    { id: 70, name: "한 발로 균형 잡고 서기", type: "무산소", sets: 3, reps: "30초", intensity: 5, caution: "지지대 근처에서 수행" },
    { id: 71, name: "제자리 걷기", type: "유산소", sets: 1, reps: "5분", intensity: 3 },
    { id: 72, name: "빠르게 제자리 걷기", type: "유산소", sets: 1, reps: "3분", intensity: 5 },
    { id: 73, name: "제자리 뛰기 (가볍게)", type: "유산소", sets: 3, reps: "1분", intensity: 6 },
    { id: 74, name: "무릎 높이 들어 걷기 (니업)", type: "유산소", sets: 3, reps: "20회", intensity: 5 },
    { id: 75, name: "팔 벌려 뛰기 (PT체조)", type: "유산소", sets: 3, reps: "15회", intensity: 7 },
    { id: 76, name: "슬로우 버피", type: "유산소", sets: 3, reps: "10회", intensity: 8, caution: "심장 질환 있으면 피하기" },
    { id: 77, name: "사이드 스텝 (좌우 이동)", type: "유산소", sets: 3, reps: "1분", intensity: 4 },
    { id: 78, name: "엉덩이 차며 뛰기 (벗킥)", type: "유산소", sets: 3, reps: "1분", intensity: 6 },
    { id: 79, name: "제자리 줄넘기 (흉내)", type: "유산소", sets: 3, reps: "1분", intensity: 6 },
    { id: 80, name: "스케이터 점프", type: "유산소", sets: 3, reps: "15회", intensity: 7, caution: "골다공증 있으면 피하기" },
    { id: 81, name: "앞뒤로 박수 치며 걷기", type: "유산소", sets: 1, reps: "3분", intensity: 4 },
    { id: 82, name: "쉐도우 복싱 (허공 펀치)", type: "유산소", sets: 3, reps: "1분", intensity: 6 },
    { id: 83, name: "암 워킹 (손으로 걷기)", type: "유산소", sets: 3, reps: "8회", intensity: 8 },
    { id: 84, name: "트위스트 점프", type: "유산소", sets: 3, reps: "20회", intensity: 6 },
    { id: 85, name: "하늘 찌르며 걷기", type: "유산소", sets: 3, reps: "2분", intensity: 5 },
    { id: 86, name: "앞차기 하며 걷기", type: "유산소", sets: 3, reps: "1분", intensity: 6 },
    { id: 87, name: "V-스텝 (발 벌렸다 모으기)", type: "유산소", sets: 3, reps: "1분", intensity: 5 },
    { id: 88, name: "그레이프바인 (스텝 꼬아 걷기)", type: "유산소", sets: 3, reps: "1분", intensity: 5 },
    { id: 89, name: "제자리 점프 스쿼트", type: "유산소", sets: 3, reps: "10회", intensity: 9, caution: "고혈압 있으면 피하기" },
    { id: 90, name: "마운틴 클라이머 (빠르게)", type: "유산소", sets: 3, reps: "30초", intensity: 9 },
    { id: 91, name: "런지 니업", type: "유산소", sets: 3, reps: "10회", intensity: 8 },
    { id: 92, name: "플랭크 잭", type: "유산소", sets: 3, reps: "15회", intensity: 9 },
    { id: 93, name: "하이 니 (빠르게 무릎 들기)", type: "유산소", sets: 3, reps: "30초", intensity: 8 },
    { id: 94, name: "스탠딩 크런치", type: "유산소", sets: 3, reps: "20회", intensity: 6 },
    { id: 95, name: "꽃게 걸음 (옆으로 걷기)", type: "유산소", sets: 3, reps: "1분", intensity: 5 },
    { id: 96, name: "뒤로 걷기", type: "유산소", sets: 1, reps: "3분", intensity: 4, caution: "안전한 곳에서만" },
    { id: 97, name: "팔 돌리며 제자리 뛰기", type: "유산소", sets: 3, reps: "1분", intensity: 7 },
    { id: 98, name: "와이드 스쿼트 펄스", type: "유산소", sets: 3, reps: "20초", intensity: 7 },
    { id: 99, name: "수건 잡고 만세하며 걷기", type: "유산소", sets: 3, reps: "3분", intensity: 4 },
    { id: 100, name: "전신 털기 (쿨다운)", type: "유산소", sets: 1, reps: "2분", intensity: 2 }
];

const categories = [
    { key: 'ALL', label: '전체', icon: '🏃' },
    { key: '스트레칭', label: '스트레칭', icon: '🧘' },
    { key: '무산소', label: '근력', icon: '💪' },
    { key: '유산소', label: '유산소', icon: '❤️' },
];

export default function ExercisePage() {
    const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [activeSession, setActiveSession] = useState<Exercise | null>(null);
    const [completedExercises, setCompletedExercises] = useState<number[]>([]);

    const filteredExercises = selectedCategory === 'ALL'
        ? allExercises
        : allExercises.filter(e => e.type === selectedCategory);

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
                <button
                    className={`btn btn-sm ${styles.prescriptionBtn}`}
                    onClick={() => window.location.href = '/prescription'}
                    style={{ marginTop: '12px' }}
                >
                    📋 나의 맞춤 처방 보기
                </button>
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
                    const isCompleted = completedExercises.includes(exercise.id);
                    return (
                        <div
                            key={exercise.id}
                            className={`card ${styles.exerciseCard} ${isCompleted ? styles.completedCard : ''}`}
                            onClick={() => setSelectedExercise(exercise)}
                        >
                            {isCompleted && <div className={styles.completedBadge}>✓ 완료</div>}
                            <div className={styles.exerciseHeader}>
                                <div
                                    className={styles.categoryBadge}
                                    style={{ backgroundColor: getCategoryColor(exercise.type) }}
                                >
                                    {getCategoryLabel(exercise.type)}
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
                                    {exercise.reps}
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
                            style={{ backgroundColor: getCategoryColor(selectedExercise.type) }}
                        >
                            {getCategoryLabel(selectedExercise.type)}
                        </div>

                        <h2 className={styles.modalTitle}>{selectedExercise.name}</h2>
                        <p className="caption">{selectedExercise.description}</p>

                        <div className={styles.modalStats}>
                            <div className={styles.modalStatItem}>
                                <span className={styles.modalStatLabel}>세트</span>
                                <span className={styles.modalStatValue}>{selectedExercise.sets}</span>
                            </div>
                            <div className={styles.modalStatItem}>
                                <span className={styles.modalStatLabel}>매회</span>
                                <span className={styles.modalStatValue}>
                                    {selectedExercise.reps}
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
                            <button
                                className="btn btn-primary btn-lg btn-block"
                                onClick={() => {
                                    setActiveSession(selectedExercise);
                                    setSelectedExercise(null);
                                }}
                            >
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

            {/* Exercise Session */}
            {activeSession && (
                <ExerciseSession
                    exercise={activeSession}
                    onComplete={() => {
                        setCompletedExercises([...completedExercises, activeSession.id]);
                        setActiveSession(null);
                    }}
                    onClose={() => setActiveSession(null)}
                />
            )}
        </div>
    );
}
