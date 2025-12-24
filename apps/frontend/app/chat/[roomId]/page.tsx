'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    sender_type: 'user' | 'coach';
    content: string;
    is_read: boolean;
    created_at: string;
}

interface ChatRoom {
    id: string;
    coach_name: string;
    user_id: string;
}

export default function ChatRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [room, setRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchRoomAndMessages();
        setupRealtimeSubscription();

        return () => {
            supabase.channel(`room:${roomId}`).unsubscribe();
        };
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchRoomAndMessages = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUserId(user.id);

            // 채팅방 정보 가져오기
            const { data: roomData, error: roomError } = await supabase
                .from('chat_rooms')
                .select('*')
                .eq('id', roomId)
                .single();

            if (roomError || !roomData) {
                router.push('/chat');
                return;
            }
            setRoom(roomData);

            // 메시지 가져오기
            const { data: messagesData, error: messagesError } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (messagesError) throw messagesError;
            setMessages(messagesData || []);
        } catch (error) {
            console.error('Error fetching room:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${roomId}`,
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentUserId || isSending) return;

        setIsSending(true);
        const content = newMessage.trim();
        setNewMessage('');

        // 낙관적 UI 업데이트 - 즉시 메시지 표시
        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            room_id: roomId,
            sender_id: currentUserId,
            sender_type: 'user',
            content,
            is_read: false,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            // 메시지 저장
            const { data: insertedMsg, error } = await supabase
                .from('chat_messages')
                .insert({
                    room_id: roomId,
                    sender_id: currentUserId,
                    sender_type: 'user',
                    content,
                })
                .select()
                .single();

            if (error) {
                console.error('Message insert error:', error);
                // 실패 시 임시 메시지 제거
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
                setNewMessage(content);
                alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
                return;
            }

            // 임시 메시지를 실제 메시지로 교체
            if (insertedMsg) {
                setMessages(prev => prev.map(m =>
                    m.id === tempMessage.id ? insertedMsg : m
                ));
            }

            // 채팅방 마지막 메시지 업데이트
            await supabase
                .from('chat_rooms')
                .update({
                    last_message: content,
                    last_message_at: new Date().toISOString(),
                })
                .eq('id', roomId);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            setNewMessage(content);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push('/chat')}>
                    ←
                </button>
                <div className={styles.headerInfo}>
                    <span className={styles.coachName}>{room?.coach_name}</span>
                    <span className={styles.status}>온라인</span>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <div className={styles.emptyMessages}>
                        <p>코치님에게 첫 메시지를 보내보세요! 👋</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`${styles.message} ${msg.sender_type === 'user' ? styles.sent : styles.received}`}
                        >
                            <div className={styles.messageBubble}>
                                {msg.content}
                            </div>
                            <span className={styles.messageTime}>{formatTime(msg.created_at)}</span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className={styles.input}
                    disabled={isSending}
                />
                <button
                    className={styles.sendButton}
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                >
                    {isSending ? '...' : '전송'}
                </button>
            </div>
        </div>
    );
}
