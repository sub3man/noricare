'use client';

import { useState } from 'react';
import styles from './NutritionTracker.module.css';

interface NutritionItem {
    id: string;
    label: string;
    icon: string;
    protein: number; // 단백질 g
    portion: string;
}

const proteinFoods: NutritionItem[] = [
    { id: 'egg', label: '계란', icon: '🥚', protein: 6, portion: '1개' },
    { id: 'milk', label: '우유', icon: '🥛', protein: 8, portion: '1컵' },
    { id: 'yogurt', label: '요거트', icon: '🥛', protein: 5, portion: '1개' },
    { id: 'tofu', label: '두부', icon: '🧈', protein: 8, portion: '반모' },
    { id: 'chicken', label: '닭고기', icon: '🍗', protein: 25, portion: '1조각' },
    { id: 'fish', label: '생선', icon: '🐟', protein: 20, portion: '1토막' },
    { id: 'pork', label: '돼지고기', icon: '🥩', protein: 22, portion: '손바닥' },
    { id: 'beef', label: '소고기', icon: '🥩', protein: 26, portion: '손바닥' },
    { id: 'beans', label: '콩/두유', icon: '🫘', protein: 7, portion: '1컵' },
    { id: 'cheese', label: '치즈', icon: '🧀', protein: 7, portion: '1장' },
];

interface NutritionTrackerProps {
    userWeight?: number; // kg (for protein recommendation)
    onClose?: () => void;
}

export default function NutritionTracker({ userWeight = 60, onClose }: NutritionTrackerProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
    const [showComplete, setShowComplete] = useState(false);

    const recommendedProtein = Math.round(userWeight * 1.2); // 노인 권장: 1.2g/kg

    const consumedProtein = selectedItems.reduce((sum, id) => {
        const item = proteinFoods.find(f => f.id === id);
        return sum + (item?.protein || 0);
    }, 0);

    const progressPercent = Math.min((consumedProtein / recommendedProtein) * 100, 100);

    const handleToggle = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        const data = {
            date: new Date().toISOString(),
            mealTime,
            items: selectedItems,
            totalProtein: consumedProtein,
            timestamp: new Date().toISOString(),
        };
        console.log('Nutrition saved:', data);
        // TODO: Save to backend
        setShowComplete(true);
    };

    if (showComplete) {
        return (
            <div className={styles.container}>
                <div className={styles.completeCard}>
                    <span className={styles.completeIcon}>✨</span>
                    <h3>기록 완료!</h3>
                    <p>오늘 단백질 섭취: <strong>{consumedProtein}g</strong></p>
                    <p className={styles.goalText}>
                        {consumedProtein >= recommendedProtein
                            ? '🎉 목표 달성! 훌륭해요!'
                            : `목표까지 ${recommendedProtein - consumedProtein}g 남았어요`}
                    </p>
                    {onClose && (
                        <button className="btn btn-primary btn-block mt-4" onClick={onClose}>
                            확인
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.headerIcon}>🥗</span>
                <h2 className={styles.title}>오늘의 단백질</h2>
                <p className={styles.subtitle}>간편하게 체크해주세요</p>
            </div>

            {/* Progress */}
            <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                    <span>섭취량</span>
                    <span className={styles.progressValues}>
                        <strong>{consumedProtein}g</strong> / {recommendedProtein}g
                    </span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className={styles.progressHint}>
                    💡 노인 권장량: 체중 1kg당 1.2g (ESPEN 가이드라인)
                </p>
            </div>

            {/* Meal Time */}
            <div className={styles.mealTimeSection}>
                <label>식사 시간</label>
                <div className={styles.mealTimeBtns}>
                    <button
                        className={`${styles.mealTimeBtn} ${mealTime === 'breakfast' ? styles.selected : ''}`}
                        onClick={() => setMealTime('breakfast')}
                    >
                        🌅 아침
                    </button>
                    <button
                        className={`${styles.mealTimeBtn} ${mealTime === 'lunch' ? styles.selected : ''}`}
                        onClick={() => setMealTime('lunch')}
                    >
                        ☀️ 점심
                    </button>
                    <button
                        className={`${styles.mealTimeBtn} ${mealTime === 'dinner' ? styles.selected : ''}`}
                        onClick={() => setMealTime('dinner')}
                    >
                        🌙 저녁
                    </button>
                </div>
            </div>

            {/* Food Checklist */}
            <div className={styles.foodSection}>
                <label>오늘 드신 음식을 선택해주세요</label>
                <div className={styles.foodGrid}>
                    {proteinFoods.map((food) => (
                        <button
                            key={food.id}
                            className={`${styles.foodBtn} ${selectedItems.includes(food.id) ? styles.selected : ''}`}
                            onClick={() => handleToggle(food.id)}
                        >
                            <span className={styles.foodIcon}>{food.icon}</span>
                            <span className={styles.foodLabel}>{food.label}</span>
                            <span className={styles.foodProtein}>{food.protein}g</span>
                            {selectedItems.includes(food.id) && (
                                <span className={styles.checkMark}>✓</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Tips */}
            <div className={styles.tipCard}>
                <span className={styles.tipIcon}>💡</span>
                <div>
                    <strong>매 식사 팁</strong>
                    <p>매 식사마다 단백질 20-30g을 섭취하면 근육 유지에 효과적이에요!</p>
                </div>
            </div>

            {/* Action Button */}
            <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handleSave}
                disabled={selectedItems.length === 0}
            >
                기록하기
            </button>
        </div>
    );
}
