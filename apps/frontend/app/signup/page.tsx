'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

type Step = 1 | 2 | 3 | 4;

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    // Validation
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = password.length >= 6;
    const passwordsMatch = password === confirmPassword;

    const handleNextStep = () => {
        setError('');
        if (step < 4) {
            setStep((prev) => (prev + 1) as Step);
        }
    };

    const handlePrevStep = () => {
        setError('');
        if (step > 1) {
            setStep((prev) => (prev - 1) as Step);
        }
    };

    const handleSignup = async () => {
        setError('');
        setIsLoading(true);

        try {
            // 1. Supabase Auth로 사용자 생성
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    setError('이미 가입된 이메일입니다.');
                } else {
                    setError(authError.message);
                }
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // 2. 사용자 프로필 테이블에 추가 정보 저장
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        name: name,
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // 프로필 생성 실패해도 일단 진행 (나중에 업데이트 가능)
                }

                // 가입 완료 화면으로 이동
                setStep(4);
            }
        } catch (err) {
            setError('회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const goToHome = () => {
        router.push('/');
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>이메일을 입력해주세요</h2>
                            <p className={styles.stepSubtitle}>로그인에 사용할 이메일 주소입니다</p>
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                className={styles.input}
                                autoFocus
                                autoComplete="email"
                            />
                            {email && !isValidEmail && (
                                <p className={styles.inputHint}>올바른 이메일 형식을 입력해주세요</p>
                            )}
                        </div>
                        <button
                            className={styles.nextButton}
                            onClick={handleNextStep}
                            disabled={!isValidEmail}
                        >
                            다음
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>비밀번호를 설정해주세요</h2>
                            <p className={styles.stepSubtitle}>6자 이상으로 입력해주세요</p>
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호"
                                className={styles.input}
                                autoFocus
                                autoComplete="new-password"
                            />
                            {password && !isValidPassword && (
                                <p className={styles.inputHint}>비밀번호는 6자 이상이어야 합니다</p>
                            )}
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호 확인"
                                className={styles.input}
                                autoComplete="new-password"
                            />
                            {confirmPassword && !passwordsMatch && (
                                <p className={styles.inputHint}>비밀번호가 일치하지 않습니다</p>
                            )}
                        </div>
                        <button
                            className={styles.nextButton}
                            onClick={handleNextStep}
                            disabled={!isValidPassword || !passwordsMatch}
                        >
                            다음
                        </button>
                    </div>
                );

            case 3:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>이름을 알려주세요</h2>
                            <p className={styles.stepSubtitle}>서비스에서 사용할 이름입니다</p>
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름 (예: 홍길동)"
                                className={styles.input}
                                autoFocus
                                autoComplete="name"
                            />
                        </div>
                        {error && (
                            <div className={styles.errorMessage}>
                                <span className={styles.errorIcon}>⚠️</span>
                                {error}
                            </div>
                        )}
                        <button
                            className={styles.nextButton}
                            onClick={handleSignup}
                            disabled={!name.trim() || isLoading}
                        >
                            {isLoading ? '가입 중...' : '가입하기'}
                        </button>
                    </div>
                );

            case 4:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.completeIcon}>🎉</div>
                        <div className={styles.stepHeader}>
                            <h2 className={styles.stepTitle}>가입을 환영합니다!</h2>
                            <p className={styles.stepSubtitle}>
                                {name}님, 노리케어와 함께<br />
                                건강한 노후를 시작하세요
                            </p>
                        </div>
                        <button
                            className={styles.nextButton}
                            onClick={goToHome}
                        >
                            시작하기
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Progress Bar */}
                {step < 4 && (
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>{step} / 3</span>
                    </div>
                )}

                {/* Back Button */}
                {step > 1 && step < 4 && (
                    <button className={styles.backButton} onClick={handlePrevStep}>
                        ← 이전
                    </button>
                )}

                {/* Step Content */}
                {renderStep()}

                {/* Login Link */}
                {step < 4 && (
                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            이미 계정이 있으신가요?{' '}
                            <Link href="/login" className={styles.link}>
                                로그인
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
