'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('이메일 또는 비밀번호가 올바르지 않습니다.');
                } else {
                    setError(error.message);
                }
                return;
            }

            if (data.user) {
                router.push('/');
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>노리케어</h1>
                    <p className={styles.subtitle}>건강한 노후를 위한 첫걸음</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className={styles.input}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            className={styles.input}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            <span className={styles.errorIcon}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading || !email || !password}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                {/* Signup Link */}
                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        아직 계정이 없으신가요?{' '}
                        <Link href="/signup" className={styles.link}>
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
