'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface UserProfile {
    name: string;
    email: string;
    birthDate: string;
    gender: string;
    phone: string;
}

interface HealthSummary {
    sppbScore: number;
    lastAssessment: string;
    totalExercises: number;
    currentStreak: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        birthDate: '',
        gender: '',
        phone: '',
    });

    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                const newProfile = {
                    name: profileData.name || '',
                    email: profileData.email || user.email || '',
                    birthDate: profileData.birth_date || '',
                    gender: profileData.gender || '',
                    phone: profileData.phone || '',
                };
                setProfile(newProfile);
                setEditedProfile(newProfile);
            } else {
                setProfile(prev => ({ ...prev, email: user.email || '' }));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            await supabase.auth.signOut();
            router.push('/login');
        }
    };

    const healthSummary: HealthSummary = {
        sppbScore: 9,
        lastAssessment: '2024-12-15',
        totalExercises: 45,
        currentStreak: 5,
    };

    const handleSave = () => {
        setProfile(editedProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const menuItems = [
        { icon: '🔔', label: '알림 설정', href: '#' },
        { icon: '🔒', label: '개인정보 보호', href: '#' },
        { icon: '📊', label: '데이터 내보내기', href: '#' },
        { icon: '❓', label: '도움말', href: '#' },
        { icon: '📝', label: '이용약관', href: '#' },
        { icon: '💬', label: '문의하기', href: '#' },
    ];

    if (isLoading) {
        return (
            <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <p>불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in">
            {/* Profile Header */}
            <section className={styles.profileHeader}>
                <div className={styles.avatar}>
                    <span>{profile.name.charAt(0)}</span>
                </div>
                <h2 className="title">{profile.name}</h2>
                <p className="caption">{profile.email}</p>
            </section>

            {/* Health Stats */}
            <section className={`card ${styles.healthStats}`}>
                <h3 className="card-title mb-4">건강 요약</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>📊</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{healthSummary.sppbScore}점</span>
                            <span className={styles.statLabel}>SPPB 점수</span>
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>🔥</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{healthSummary.currentStreak}일</span>
                            <span className={styles.statLabel}>연속 운동</span>
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>🏋️</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{healthSummary.totalExercises}회</span>
                            <span className={styles.statLabel}>총 운동횟수</span>
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>📅</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>12/15</span>
                            <span className={styles.statLabel}>최근 평가</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Info */}
            <section className={`card ${styles.profileInfo} mt-4`}>
                <div className={styles.sectionHeader}>
                    <h3 className="card-title">개인 정보</h3>
                    {!isEditing ? (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setIsEditing(true)}
                        >
                            수정
                        </button>
                    ) : null}
                </div>

                {!isEditing ? (
                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>이름</span>
                            <span className={styles.infoValue}>{profile.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>이메일</span>
                            <span className={styles.infoValue}>{profile.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>생년월일</span>
                            <span className={styles.infoValue}>{profile.birthDate}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>성별</span>
                            <span className={styles.infoValue}>
                                {profile.gender === 'M' ? '남성' : '여성'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>전화번호</span>
                            <span className={styles.infoValue}>{profile.phone}</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles.editForm}>
                        <div className="input-group">
                            <label className="input-label">이름</label>
                            <input
                                type="text"
                                value={editedProfile.name}
                                onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                                className="input"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">이메일</label>
                            <input
                                type="email"
                                value={editedProfile.email}
                                onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                                className="input"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">생년월일</label>
                            <input
                                type="date"
                                value={editedProfile.birthDate}
                                onChange={(e) => setEditedProfile(prev => ({ ...prev, birthDate: e.target.value }))}
                                className="input"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">전화번호</label>
                            <input
                                type="tel"
                                value={editedProfile.phone}
                                onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                                className="input"
                            />
                        </div>
                        <div className={styles.editActions}>
                            <button
                                className="btn btn-secondary"
                                onClick={handleCancel}
                            >
                                취소
                            </button>
                            <button
                                className="btn btn-primary flex-1"
                                onClick={handleSave}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Menu List */}
            <section className="card mt-4">
                <nav className={styles.menuList}>
                    {menuItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.href}
                            className={styles.menuItem}
                        >
                            <span className={styles.menuIcon}>{item.icon}</span>
                            <span className={styles.menuLabel}>{item.label}</span>
                            <svg
                                className={styles.menuArrow}
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </a>
                    ))}
                </nav>
            </section>

            {/* Logout */}
            <section className="mt-6 mb-8">
                <button
                    className="btn btn-ghost btn-block text-error"
                    onClick={handleLogout}
                >
                    로그아웃
                </button>
            </section>

            {/* App Version */}
            <p className="text-center caption mb-8">
                Noricare v1.0.0
            </p>
        </div>
    );
}
