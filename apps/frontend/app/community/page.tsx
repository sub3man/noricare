'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Post {
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    media_url: string | null;
    media_type: string | null;
    cheer_count: number;
    comment_count: number;
    created_at: string;
    has_cheered?: boolean;
}

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
        }
    };

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const { data: postsData, error } = await supabase
                .from('community_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 현재 사용자의 응원 여부 확인
            const { data: { user } } = await supabase.auth.getUser();
            if (user && postsData) {
                const { data: cheers } = await supabase
                    .from('post_cheers')
                    .select('post_id')
                    .eq('user_id', user.id);

                const cheeredPostIds = new Set(cheers?.map(c => c.post_id) || []);
                const postsWithCheerStatus = postsData.map(post => ({
                    ...post,
                    has_cheered: cheeredPostIds.has(post.id)
                }));
                setPosts(postsWithCheerStatus);
            } else {
                setPosts(postsData || []);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheer = async (postId: string, hasAlreadyCheered: boolean) => {
        if (!currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            if (hasAlreadyCheered) {
                // 응원 취소
                await supabase
                    .from('post_cheers')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', currentUserId);

                // 카운트 감소
                await supabase
                    .from('community_posts')
                    .update({ cheer_count: posts.find(p => p.id === postId)!.cheer_count - 1 })
                    .eq('id', postId);
            } else {
                // 응원 추가
                await supabase
                    .from('post_cheers')
                    .insert({ post_id: postId, user_id: currentUserId });

                // 카운트 증가
                await supabase
                    .from('community_posts')
                    .update({ cheer_count: posts.find(p => p.id === postId)!.cheer_count + 1 })
                    .eq('id', postId);
            }

            // UI 업데이트
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        has_cheered: !hasAlreadyCheered,
                        cheer_count: hasAlreadyCheered ? post.cheer_count - 1 : post.cheer_count + 1
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Error toggling cheer:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return date.toLocaleDateString('ko-KR');
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>커뮤니티</h1>
                <Link href="/community/write" className={styles.writeButton}>
                    ✏️ 글쓰기
                </Link>
            </div>

            {/* Posts Feed */}
            <div className={styles.feed}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>불러오는 중...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>📝</div>
                        <p>아직 게시물이 없습니다</p>
                        <p className={styles.emptySubtext}>첫 번째 글을 작성해보세요!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <article key={post.id} className={styles.post}>
                            <div className={styles.postHeader}>
                                <div className={styles.avatar}>
                                    {post.user_name.charAt(0)}
                                </div>
                                <div className={styles.postMeta}>
                                    <span className={styles.userName}>{post.user_name}</span>
                                    <span className={styles.postTime}>{formatTime(post.created_at)}</span>
                                </div>
                            </div>

                            <div className={styles.postContent}>
                                <p>{post.content}</p>
                                {post.media_url && (
                                    <div className={styles.mediaContainer}>
                                        {post.media_type === 'video' ? (
                                            <video src={post.media_url} controls className={styles.media} />
                                        ) : (
                                            <img src={post.media_url} alt="" className={styles.media} />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={styles.postActions}>
                                <button
                                    className={`${styles.actionButton} ${post.has_cheered ? styles.cheered : ''}`}
                                    onClick={() => handleCheer(post.id, post.has_cheered || false)}
                                >
                                    <span className={styles.actionIcon}>👏</span>
                                    <span>{post.cheer_count}</span>
                                </button>
                                <button className={styles.actionButton}>
                                    <span className={styles.actionIcon}>💬</span>
                                    <span>{post.comment_count}</span>
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
