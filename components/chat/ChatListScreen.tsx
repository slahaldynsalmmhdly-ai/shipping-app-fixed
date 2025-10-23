import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { chatCache } from '../../utils/chatCache';
import { fetchWithRetry } from '../../utils/apiHelper';
import './ChatListScreen.css';

interface Participant {
    _id: string;
    name: string;
    avatar?: string;
}

interface LastMessage {
    content?: string;
    messageType: string;
    mediaUrl?: string;
    createdAt: string;
    isSender: boolean;
}

interface Conversation {
    _id: string;
    participant: Participant;
    lastMessage: LastMessage | null;
    unreadCount: number;
    lastMessageTime: string;
}

const getFullImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} س`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} د`;
    return 'الآن';
};

const ChatListItemSkeleton: React.FC = () => (
    <div className="chat-list-item skeleton">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-text">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line message"></div>
        </div>
    </div>
);

interface ChatListScreenProps {
  className?: string;
  onNavigateBack: () => void;
  onOpenNewChat: () => void;
  onOpenChat: (conversation: any) => void;
  user: any;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ className, onNavigateBack, onOpenNewChat, onOpenChat, user }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('الرجاء تسجيل الدخول لعرض المحادثات.');
            setIsLoading(false);
            return;
        }
    
        setIsLoading(true);
        setError(null);
        
        try {
            // استخدام fetchWithRetry بدلاً من fetch
            const response = await fetchWithRetry(
                `${API_BASE_URL}/api/v1/chat/conversations`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                },
                3, // عدد المحاولات
                2000 // التأخير بين المحاولات (2 ثانية)
            );
            
            if (!response.ok) {
                throw new Error('فشل في تحميل المحادثات.');
            }
            
            const data = await response.json();
            const newConversations = Array.isArray(data) ? data : (data.conversations || []);
            
            chatCache.saveConversations(newConversations);
            setConversations(newConversations);
            setError(null);
        } catch (err: any) {
            console.error('خطأ في جلب المحادثات:', err);
            if (conversations.length === 0) {
                setError('تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // انتظر حتى يكون المستخدم مسجل دخول
        if (!user) {
            setError('الرجاء تسجيل الدخول لعرض المحادثات.');
            setIsLoading(false);
            return;
        }
    
        // مسح الخطأ
        setError(null);
    
        // 1. عرض البيانات من Cache فوراً
        const cachedConversations = chatCache.getConversations();
        if (cachedConversations.length > 0) {
            setConversations(cachedConversations);
        } else {
            setIsLoading(true);
        }
    
        // 2. جلب البيانات الجديدة في الخلفية
        fetchConversations();
    }, [user]); // تغيير من [] إلى [user]

    const renderContent = () => {
        // إذا كان هناك محادثات في Cache، اعرضها حتى أثناء التحميل
        if (conversations.length > 0) {
            return conversations.map(conv => {
                const participant = conv.participant;
                if (!participant) return null;
    
                return (
                    <div key={conv._id} className="chat-list-item" onClick={() => onOpenChat(conv)}>
                        <img 
                            src={getFullImageUrl(participant.avatar) || `https://ui-avatars.com/api/?name=${participant.name.charAt(0)}`} 
                            alt={participant.name} 
                            className="chat-list-item-avatar" 
                        />
                        <div className="chat-list-item-text">
                            <div className="name-time">
                                <h3>{participant.name}</h3>
                                <span className="timestamp">{timeAgo(conv.lastMessage?.createdAt || conv.lastMessageTime)}</span>
                            </div>
                            <p className="last-message">
                                {conv.lastMessage?.messageType === 'text' && conv.lastMessage.content}
                                {conv.lastMessage?.messageType === 'image' && '📷 صورة'}
                                {conv.lastMessage?.messageType === 'video' && '🎥 فيديو'}
                                {conv.lastMessage?.messageType === 'audio' && '🎤 رسالة صوتية'}
                                {!conv.lastMessage && 'ابدأ محادثة جديدة'}
                            </p>
                        </div>
                        {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                    </div>
                );
            });
        }
        
        // إذا لم يكن هناك محادثات وجاري التحميل
        if (isLoading) {
            return [...Array(5)].map((_, i) => <ChatListItemSkeleton key={i} />);
        }
        
        // إذا كان هناك خطأ
        if (error) {
            return (
                <div className="chat-list-feedback">
                    <p>{error}</p>
                    {error.includes('الاتصال بالخادم') && (
                        <button 
                            onClick={fetchConversations} 
                            style={{ 
                                marginTop: '10px', 
                                padding: '10px 20px', 
                                background: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            إعادة المحاولة
                        </button>
                    )}
                </div>
            );
        }
        
        // إذا لم يكن هناك محادثات
        return <p className="chat-list-feedback">لا توجد محادثات بعد. ابدأ محادثة جديدة!</p>;
    };

    return (
        <div className={`app-container chat-list-container ${className || ''}`}>
            <header className="chat-list-header">
                <div className="chat-list-header-top">
                    <button onClick={onNavigateBack} className="back-button" aria-label="الرجوع">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <h1>الدردشات</h1>
                </div>
                <div className="chat-list-search">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="search" placeholder="بحث في الدردشات..." />
                </div>
            </header>

            <main className="app-content chat-list-content">
                {renderContent()}
            </main>
            
            <button className="new-chat-fab" onClick={onOpenNewChat} aria-label="دردشة جديدة">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-0.417m-4.47-4.47a9.75 9.75 0 01-1.326-4.328C3 7.444 7.03 3.75 12 3.75c4.97 0 9 3.694 9 8.25z" />
                </svg>
            </button>
        </div>
    );
};

export default ChatListScreen;