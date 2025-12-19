'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface FeedbackData {
    prescriptionId: string;
    rpe: number;
    hasPain: boolean;
    painRegion: string;
    satisfaction: number;
}

const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

const mockWeekData = [
    { day: '월', completed: true, exercises: 4 },
    { day: '화', completed: true, exercises: 3 },
    { day: '수', completed: true, exercises: 4 },
    { day: '목', completed: false, exercises: 0 },
    { day: '금', completed: true, exercises: 4 },
    { day: '토', completed: false, exercises: 2, partial: true },
    { day: '일', completed: false, exercises: 0, today: true },
];

const mockHistory = [
    { date: '12월 18일', exercises: ['스쿼트', '런지', '플랭크', '스트레칭'], rpe: 6, satisfaction: 4 },
    { date: '12월 17일', exercises: ['스쿼트', '한 발 서기', '발뒤꿈치 들기'], rpe: 5, satisfaction: 5 },
    { date: '12월 16일', exercises: ['스쿼트', '런지', '플랭크', '제자리 걷기'], rpe: 7, satisfaction: 3 },
];

export default function ProgressPage() {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackData, setFeedbackData] = useState<FeedbackData>({
        prescriptionId: '',
        rpe: 5,
        hasPain: false,
        painRegion: '',
        satisfaction: 3,
    });

    const completedDays = mockWeekData.filter(d => d.completed).length;
    const partialDays = mockWeekData.filter(d => d.partial).length;

    const handleFeedbackSubmit = async () => {
        // In production, this would call the API
        console.log('Submitting feedback:', feedbackData);
        setShowFeedbackModal(false);
        // Reset form
        setFeedbackData({
            prescriptionId: '',
            rpe: 5,
            hasPain: false,
            painRegion: '',
            satisfaction: 3,
        });
    };

    const getSatisfactionEmoji = (level: number) => {
        const emojis = ['😢', '😕', '😐', '🙂', '😄'];
        return emojis[level - 1] || '😐';
    };

    return (
        <div className="container animate-fade-in">
            {/* Header */}
            <section className={styles.header}>
                <h2 className="headline">진행 현황</h2>
                <p className="caption mt-2">꾸준히 운동하고 계시네요! 💪</p>
            </section>

            {/* Weekly Overview */}
            <section className={`card ${styles.weeklyCard}`}>
                <div className="card-header">
                    <h3 className="card-title">이번 주 운동</h3>
                    <span className="badge badge-primary">{completedDays}/7일 완료</span>
                </div>

                <div className={styles.weekGrid}>
                    {mockWeekData.map((day, idx) => (
                        <div
                            key={idx}
                            className={`${styles.dayItem} ${day.completed ? styles.completed : ''} ${day.partial ? styles.partial : ''} ${day.today ? styles.today : ''}`}
                        >
                            <span className={styles.dayLabel}>{day.day}</span>
                            <div className={styles.dayIcon}>
                                {day.completed ? '✓' : day.partial ? '○' : day.today ? '•' : ''}
                            </div>
                            {day.exercises > 0 && (
                                <span className={styles.dayCount}>{day.exercises}</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.weekStats}>
                    <div className={styles.weekStatItem}>
                        <span className={styles.weekStatValue}>{completedDays + partialDays}</span>
                        <span className={styles.weekStatLabel}>활동일</span>
                    </div>
                    <div className={styles.weekStatItem}>
                        <span className={styles.weekStatValue}>
                            {mockWeekData.reduce((sum, d) => sum + d.exercises, 0)}
                        </span>
                        <span className={styles.weekStatLabel}>총 운동</span>
                    </div>
                    <div className={styles.weekStatItem}>
                        <span className={styles.weekStatValue}>
                            {Math.round((completedDays / 7) * 100)}%
                        </span>
                        <span className={styles.weekStatLabel}>달성률</span>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.quickActions}>
                <button
                    className="btn btn-primary btn-lg btn-block"
                    onClick={() => setShowFeedbackModal(true)}
                >
                    오늘의 피드백 남기기
                </button>
            </section>

            {/* Progress Stats */}
            <section className={`card ${styles.statsCard} mt-5`}>
                <h3 className="card-title mb-4">📊 월간 통계</h3>
                <div className={styles.progressBars}>
                    <div className={styles.progressItem}>
                        <div className={styles.progressHeader}>
                            <span>근력 운동</span>
                            <span className={styles.progressPercent}>85%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: '85%' }} />
                        </div>
                    </div>
                    <div className={styles.progressItem}>
                        <div className={styles.progressHeader}>
                            <span>유산소</span>
                            <span className={styles.progressPercent}>60%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: '60%', backgroundColor: 'var(--red-500)' }} />
                        </div>
                    </div>
                    <div className={styles.progressItem}>
                        <div className={styles.progressHeader}>
                            <span>유연성</span>
                            <span className={styles.progressPercent}>90%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: '90%', backgroundColor: 'var(--orange-500)' }} />
                        </div>
                    </div>
                    <div className={styles.progressItem}>
                        <div className={styles.progressHeader}>
                            <span>균형</span>
                            <span className={styles.progressPercent}>70%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: '70%', backgroundColor: 'var(--teal-500)' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* History */}
            <section className="mt-6">
                <h3 className="title mb-4">📅 최근 기록</h3>
                <div className={styles.historyList}>
                    {mockHistory.map((item, idx) => (
                        <div key={idx} className={`card ${styles.historyItem}`}>
                            <div className={styles.historyHeader}>
                                <span className={styles.historyDate}>{item.date}</span>
                                <span className={styles.historySatisfaction}>
                                    {getSatisfactionEmoji(item.satisfaction)}
                                </span>
                            </div>
                            <div className={styles.historyExercises}>
                                {item.exercises.map((ex, i) => (
                                    <span key={i} className={styles.exerciseTag}>{ex}</span>
                                ))}
                            </div>
                            <div className={styles.historyFooter}>
                                <span className="caption">RPE: {item.rpe}/10</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className="title mb-2">오늘의 피드백</h2>
                        <p className="caption mb-5">운동 후 느낀 점을 알려주세요</p>

                        {/* RPE Scale */}
                        <div className={styles.feedbackSection}>
                            <label className={styles.feedbackLabel}>
                                운동 강도 (RPE)
                                <span className={styles.rpeValue}>{feedbackData.rpe}/10</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={feedbackData.rpe}
                                onChange={(e) => setFeedbackData(prev => ({ ...prev, rpe: Number(e.target.value) }))}
                                className={styles.slider}
                            />
                            <div className={styles.sliderLabels}>
                                <span>쉬움</span>
                                <span>적당함</span>
                                <span>힘들었음</span>
                            </div>
                        </div>

                        {/* Pain Check */}
                        <div className={styles.feedbackSection}>
                            <label className={styles.feedbackLabel}>통증 여부</label>
                            <div className={styles.toggleGroup}>
                                <button
                                    className={`${styles.toggleBtn} ${!feedbackData.hasPain ? styles.active : ''}`}
                                    onClick={() => setFeedbackData(prev => ({ ...prev, hasPain: false, painRegion: '' }))}
                                >
                                    없음 😊
                                </button>
                                <button
                                    className={`${styles.toggleBtn} ${feedbackData.hasPain ? styles.active : ''}`}
                                    onClick={() => setFeedbackData(prev => ({ ...prev, hasPain: true }))}
                                >
                                    있음 🤕
                                </button>
                            </div>
                            {feedbackData.hasPain && (
                                <input
                                    type="text"
                                    placeholder="통증 부위를 입력해주세요"
                                    value={feedbackData.painRegion}
                                    onChange={(e) => setFeedbackData(prev => ({ ...prev, painRegion: e.target.value }))}
                                    className="input mt-3"
                                />
                            )}
                        </div>

                        {/* Satisfaction */}
                        <div className={styles.feedbackSection}>
                            <label className={styles.feedbackLabel}>만족도</label>
                            <div className={styles.satisfactionGroup}>
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        className={`${styles.satisfactionBtn} ${feedbackData.satisfaction === level ? styles.active : ''}`}
                                        onClick={() => setFeedbackData(prev => ({ ...prev, satisfaction: level }))}
                                    >
                                        {getSatisfactionEmoji(level)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className="btn btn-primary btn-lg btn-block"
                                onClick={handleFeedbackSubmit}
                            >
                                제출하기
                            </button>
                            <button
                                className="btn btn-ghost btn-block"
                                onClick={() => setShowFeedbackModal(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
