'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function WritePostPage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // 현재 사용자 정보 가져오기
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('로그인이 필요합니다.');
                router.push('/login');
                return;
            }

            // 사용자 프로필에서 이름 가져오기
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', user.id)
                .single();

            const userName = profile?.name || '익명';

            // 게시물 저장
            const { error: insertError } = await supabase
                .from('community_posts')
                .insert({
                    user_id: user.id,
                    user_name: userName,
                    content: content.trim(),
                    media_url: null,
                    media_type: null,
                });

            if (insertError) {
                throw insertError;
            }

            // 성공 시 커뮤니티 페이지로 이동
            router.push('/community');
        } catch (err: any) {
            console.error('Error creating post:', err);
            setError(err.message || '게시물 작성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.cancelButton} onClick={handleCancel}>
                    취소
                </button>
                <h1 className={styles.title}>새 글 작성</h1>
                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isLoading || !content.trim()}
                >
                    {isLoading ? '등록 중...' : '등록'}
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <textarea
                    className={styles.textarea}
                    placeholder="오늘의 운동, 건강 이야기를 공유해보세요! 🏃‍♂️"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    autoFocus
                    maxLength={1000}
                />
                <div className={styles.charCount}>
                    {content.length} / 1000
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    ⚠️ {error}
                </div>
            )}

            {/* Tips */}
            <div className={styles.tips}>
                <div className={styles.tipItem}>
                    <span className={styles.tipIcon}>💡</span>
                    <span>운동 인증, 식단 공유, 건강 팁 등을 나눠보세요</span>
                </div>
                <div className={styles.tipItem}>
                    <span className={styles.tipIcon}>👏</span>
                    <span>다른 분들의 글에 응원을 보내주세요</span>
                </div>
            </div>
        </div>
    );
}
