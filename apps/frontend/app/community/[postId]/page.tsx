'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
}

interface Comment {
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    created_at: string;
}

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.postId as string;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserName, setCurrentUserName] = useState<string>('');

    useEffect(() => {
        loadData();
    }, [postId]);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();
                setCurrentUserName(profile?.name || '사용자');
            }

            // 게시물 로드
            const { data: postData } = await supabase
                .from('community_posts')
                .select('*')
                .eq('id', postId)
                .single();

            if (postData) setPost(postData);

            // 댓글 로드
            const { data: commentsData } = await supabase
                .from('post_comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            setComments(commentsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitComment = async () => {
        if (!newComment.trim() || !currentUserId || isSending) return;

        setIsSending(true);
        try {
            const { error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: postId,
                    user_id: currentUserId,
                    user_name: currentUserName,
                    content: newComment.trim(),
                });

            if (error) throw error;

            // 댓글 수 업데이트
            await supabase
                .from('community_posts')
                .update({ comment_count: (post?.comment_count || 0) + 1 })
                .eq('id', postId);

            setNewComment('');
            loadData();
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setIsSending(false);
        }
    };

    const startChatWithUser = async (targetUserId: string, targetUserName: string) => {
        if (!currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (targetUserId === currentUserId) {
            alert('자신에게는 채팅을 보낼 수 없습니다.');
            return;
        }

        try {
            const { data: existingRoom } = await supabase
                .from('chat_rooms')
                .select('id')
                .eq('user_id', currentUserId)
                .eq('coach_id', targetUserId)
                .single();

            if (existingRoom) {
                router.push(`/chat/${existingRoom.id}`);
                return;
            }

            const { data: newRoom, error } = await supabase
                .from('chat_rooms')
                .insert({
                    user_id: currentUserId,
                    user_name: currentUserName,
                    coach_id: targetUserId,
                    coach_name: targetUserName,
                    last_message: '채팅이 시작되었습니다.',
                    last_message_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            if (newRoom) router.push(`/chat/${newRoom.id}`);
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        return date.toLocaleDateString('ko-KR');
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <p style={{ textAlign: 'center', padding: '40px' }}>불러오는 중...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className={styles.container}>
                <p style={{ textAlign: 'center', padding: '40px' }}>게시물을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/community')}>
                    ← 뒤로
                </button>
                <h1 className={styles.title}>게시물</h1>
            </div>

            {/* Post */}
            <article className={styles.post}>
                <div className={styles.postHeader}>
                    <div className={styles.avatar}>{post.user_name.charAt(0)}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{post.user_name}</span>
                        <span className={styles.postTime}>{formatTime(post.created_at)}</span>
                    </div>
                    {post.user_id !== currentUserId && (
                        <button
                            className={styles.chatBtn}
                            onClick={() => startChatWithUser(post.user_id, post.user_name)}
                        >
                            ✉️ 채팅
                        </button>
                    )}
                </div>
                <div className={styles.postContent}>
                    <p>{post.content}</p>
                </div>
            </article>

            {/* Comments Section */}
            <div className={styles.commentsSection}>
                <h3 className={styles.commentsTitle}>댓글 {comments.length}개</h3>

                {/* Comment Input */}
                <div className={styles.commentInput}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className={styles.input}
                        onKeyPress={(e) => e.key === 'Enter' && submitComment()}
                    />
                    <button
                        className={styles.submitBtn}
                        onClick={submitComment}
                        disabled={!newComment.trim() || isSending}
                    >
                        {isSending ? '...' : '등록'}
                    </button>
                </div>

                {/* Comments List */}
                <div className={styles.commentsList}>
                    {comments.length === 0 ? (
                        <p className={styles.noComments}>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className={styles.comment}>
                                <div className={styles.commentHeader}>
                                    <div className={styles.commentAvatar}>
                                        {comment.user_name.charAt(0)}
                                    </div>
                                    <div className={styles.commentMeta}>
                                        <span className={styles.commentUserName}>{comment.user_name}</span>
                                        <span className={styles.commentTime}>{formatTime(comment.created_at)}</span>
                                    </div>
                                    {comment.user_id !== currentUserId && (
                                        <button
                                            className={styles.chatBtnSmall}
                                            onClick={() => startChatWithUser(comment.user_id, comment.user_name)}
                                        >
                                            ✉️
                                        </button>
                                    )}
                                </div>
                                <p className={styles.commentContent}>{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
