'use client';

import { useState } from 'react';
import styles from './NutritionTracker.module.css';

interface NutritionItem {
    id: string;
    label: string;
    icon: string;
    protein: number; // 단백질 g per unit
    unit: string;    // 최소 단위
}

const proteinFoods: NutritionItem[] = [
    { id: 'egg', label: '계란', icon: '🥚', protein: 6, unit: '1개' },
    { id: 'milk', label: '우유', icon: '🥛', protein: 8, unit: '1잔(200ml)' },
    { id: 'yogurt', label: '요거트', icon: '🥛', protein: 5, unit: '1개(100g)' },
    { id: 'tofu', label: '두부', icon: '🧈', protein: 8, unit: '반모(150g)' },
    { id: 'chicken', label: '닭고기', icon: '🍗', protein: 25, unit: '1조각(100g)' },
    { id: 'fish', label: '생선', icon: '🐟', protein: 20, unit: '1토막(100g)' },
    { id: 'pork', label: '돼지고기', icon: '🥩', protein: 22, unit: '손바닥(100g)' },
    { id: 'beef', label: '소고기', icon: '🥩', protein: 26, unit: '손바닥(100g)' },
    { id: 'beans', label: '콩/두유', icon: '🫘', protein: 7, unit: '1컵(200ml)' },
    { id: 'cheese', label: '치즈', icon: '🧀', protein: 7, unit: '1장(20g)' },
];

interface NutritionTrackerProps {
    userWeight?: number;
    onClose?: () => void;
}

export default function NutritionTracker({ userWeight = 60, onClose }: NutritionTrackerProps) {
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
    const [showComplete, setShowComplete] = useState(false);

    const recommendedProtein = Math.round(userWeight * 1.2);

    const consumedProtein = Object.entries(quantities).reduce((sum, [id, qty]) => {
        const item = proteinFoods.find(f => f.id === id);
        return sum + (item?.protein || 0) * qty;
    }, 0);

    const progressPercent = Math.min((consumedProtein / recommendedProtein) * 100, 100);

    const handleQuantityChange = (id: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[id] || 0;
            const newQty = Math.max(0, Math.min(10, current + delta));
            if (newQty === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: newQty };
        });
    };

    const handleSave = () => {
        const data = {
            date: new Date().toISOString(),
            mealTime,
            items: Object.entries(quantities).map(([id, qty]) => {
                const food = proteinFoods.find(f => f.id === id);
                return { id, name: food?.label, quantity: qty, protein: (food?.protein || 0) * qty };
            }),
            totalProtein: consumedProtein,
        };
        console.log('Nutrition saved:', data);
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
                <p className={styles.subtitle}>드신 음식의 수량을 선택해주세요</p>
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
                    💡 권장: 체중 1kg당 1.2g (ESPEN 노인 영양 가이드라인)
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

            {/* Food List with Quantity */}
            <div className={styles.foodSection}>
                <label>드신 음식을 선택하고 수량을 조절해주세요</label>
                <div className={styles.foodList}>
                    {proteinFoods.map((food) => {
                        const qty = quantities[food.id] || 0;
                        const totalProtein = food.protein * qty;
                        return (
                            <div
                                key={food.id}
                                className={`${styles.foodItem} ${qty > 0 ? styles.selected : ''}`}
                            >
                                <div className={styles.foodMain}>
                                    <span className={styles.foodIcon}>{food.icon}</span>
                                    <div className={styles.foodInfo}>
                                        <span className={styles.foodLabel}>{food.label}</span>
                                        <span className={styles.foodUnit}>{food.unit} = {food.protein}g</span>
                                    </div>
                                </div>
                                <div className={styles.quantityControl}>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => handleQuantityChange(food.id, -1)}
                                        disabled={qty === 0}
                                    >
                                        −
                                    </button>
                                    <span className={styles.qtyValue}>{qty}</span>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => handleQuantityChange(food.id, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                {qty > 0 && (
                                    <span className={styles.foodTotal}>+{totalProtein}g</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Summary */}
            {Object.keys(quantities).length > 0 && (
                <div className={styles.selectedSummary}>
                    <span>선택한 음식: </span>
                    {Object.entries(quantities).map(([id, qty]) => {
                        const food = proteinFoods.find(f => f.id === id);
                        return (
                            <span key={id} className={styles.selectedTag}>
                                {food?.icon} {food?.label} ×{qty}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Action Button */}
            <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handleSave}
                disabled={Object.keys(quantities).length === 0}
            >
                기록하기 ({consumedProtein}g)
            </button>
        </div>
    );
}
