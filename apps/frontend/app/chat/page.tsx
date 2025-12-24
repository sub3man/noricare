'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface ChatRoom {
    id: string;
    user_id: string;
    user_name: string;
    coach_id: string;
    coach_name: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

export default function ChatListPage() {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchChatRooms();
    }, []);

    const fetchChatRooms = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('chat_rooms')
                .select('*')
                .eq('user_id', user.id)
                .order('last_message_at', { ascending: false, nullsFirst: false });

            if (error) throw error;
            setChatRooms(data || []);
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

        if (diffDays === 0) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return '어제';
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        }
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    };

    // 데모용 샘플 채팅방 생성
    const createDemoRoom = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('로그인이 필요합니다.');
                return;
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', user.id)
                .single();

            const { error } = await supabase
                .from('chat_rooms')
                .insert({
                    user_id: user.id,
                    user_name: profile?.name || '사용자',
                    coach_id: 'demo-coach-1',
                    coach_name: '김건강 코치',
                    last_message: '안녕하세요! 무엇을 도와드릴까요?',
                    last_message_at: new Date().toISOString(),
                });

            if (error) throw error;
            fetchChatRooms();
        } catch (error) {
            console.error('Error creating demo room:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>코치 채팅</h1>
            </div>

            {/* Chat List */}
            <div className={styles.chatList}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>불러오는 중...</p>
                    </div>
                ) : chatRooms.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>💬</div>
                        <p>아직 채팅이 없습니다</p>
                        <p className={styles.emptySubtext}>코치와 상담을 시작해보세요</p>
                        <button className={styles.demoButton} onClick={createDemoRoom}>
                            데모 채팅방 만들기
                        </button>
                    </div>
                ) : (
                    chatRooms.map(room => (
                        <Link
                            key={room.id}
                            href={`/chat/${room.id}`}
                            className={styles.chatRoom}
                        >
                            <div className={styles.avatar}>
                                {room.coach_name.charAt(0)}
                            </div>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatHeader}>
                                    <span className={styles.coachName}>{room.coach_name}</span>
                                    <span className={styles.time}>{formatTime(room.last_message_at)}</span>
                                </div>
                                <div className={styles.lastMessage}>
                                    {room.last_message || '대화를 시작해보세요'}
                                </div>
                            </div>
                            {room.unread_count > 0 && (
                                <div className={styles.unreadBadge}>{room.unread_count}</div>
                            )}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
