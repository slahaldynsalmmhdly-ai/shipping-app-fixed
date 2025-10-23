import React, { useState, useEffect, useRef } from 'react';
import './HistoryScreen.css';
import { API_BASE_URL } from '../../config';

// --- TYPE DEFINITIONS ---
interface Participant {
    _id: string;
    name: string;
    avatar?: string;
}

interface CallLog {
    _id: string;
    caller: Participant;
    receiver: Participant;
    type: 'audio' | 'video';
    status: 'completed' | 'missed' | 'declined';
    duration: number;
    createdAt: string;
    isRead?: boolean;
}

// --- HELPER FUNCTIONS ---
const getFullImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const timeAgo = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `قبل ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `قبل ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `قبل ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `قبل ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval > 1) return `قبل ${Math.floor(interval)} دقيقة`;
    return 'الآن';
};


// --- SUB-COMPONENTS ---
const CallLogItemSkeleton: React.FC = () => (
    <div className="call-log-item skeleton">
        <div className="skeleton-avatar"></div>
        <div className="call-log-info">
            <div className="skeleton skeleton-line title"></div>
            <div className="skeleton skeleton-line subtitle"></div>
        </div>
    </div>
);

const CallLogItem: React.FC<{ call: CallLog; currentUser: any; onClick: () => void; }> = ({ call, currentUser, onClick }) => {
    const isCurrentUserCaller = call.caller._id === currentUser._id;
    const otherParticipant = isCurrentUserCaller ? call.receiver : call.caller;
    
    const isMissedByMe = call.status === 'missed' && call.receiver._id === currentUser._id;
    const isUnread = isMissedByMe && !call.isRead;
    
    const getStatusInfo = () => {
        const CallTypeIcon = call.type === 'video' 
            ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 5.5a3 3 0 01-3 3a.5.5 0 000 1h-1a.5.5 0 000 1H10a.5.5 0 000 1H8.5a.5.5 0 000 1h-1a.5.5 0 000 1H6a.5.5 0 000 1a.5.5 0 00-1 0a.5.5 0 00-.5.5v.5a3 3 0 01-3-3v-8a3 3 0 013-3h8a3 3 0 013 3v2.5z" /></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.25 6.75a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" /></svg>;
        
        if (isCurrentUserCaller) {
            const statusText = call.status === 'completed' ? `Outgoing • ${call.duration}s` : 'Cancelled';
            return { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>, text: statusText, className: 'outgoing' };
        } else {
            if (call.status === 'missed') {
                return { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>, text: 'Missed Call', className: 'missed' };
            }
            const statusText = call.status === 'completed' ? `Incoming • ${call.duration}s` : 'Declined';
            return { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>, text: statusText, className: 'incoming' };
        }
    };
    
    const statusInfo = getStatusInfo();

    return (
        <div className={`call-log-item ${isUnread ? 'unread' : ''}`} onClick={onClick}>
            {isUnread && <div className="unread-dot"></div>}
            <img 
                src={getFullImageUrl(otherParticipant.avatar) || `https://ui-avatars.com/api/?name=${otherParticipant.name.charAt(0)}`}
                alt={otherParticipant.name}
                className="call-log-avatar"
            />
            <div className="call-log-info">
                <h3>{otherParticipant.name}</h3>
                <div className={`call-log-details ${statusInfo.className}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                </div>
            </div>
            <span className="call-log-time">{timeAgo(call.createdAt)}</span>
        </div>
    );
};

// --- MAIN COMPONENT ---
const HistoryScreen: React.FC<{ className?: string; onScrollActivity?: () => void; user: any | null; }> = ({ className, onScrollActivity, user }) => {
  const contentRef = useRef<HTMLElement>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isActive = className?.includes('page-active');

  useEffect(() => {
    const scrollableElement = contentRef.current;
    if (scrollableElement && onScrollActivity) {
      scrollableElement.addEventListener('scroll', onScrollActivity, { passive: true });
      return () => {
        scrollableElement.removeEventListener('scroll', onScrollActivity);
      };
    }
  }, [onScrollActivity]);
  
  useEffect(() => {
    if (!isActive || !user) {
        setCallLogs([]);
        return;
    }

    const fetchCallLogs = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("الرجاء تسجيل الدخول لعرض السجل الخاص بك.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/call-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("فشل في تحميل سجل المكالمات.");
            const data = await response.json();
            setCallLogs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchCallLogs();
  }, [isActive, user]);
  
  const handleItemClick = async (call: CallLog) => {
    const isMissedByMe = call.status === 'missed' && call.receiver._id === user?._id;
    if (isMissedByMe && !call.isRead) {
        // Optimistic UI update
        setCallLogs(prevLogs =>
            prevLogs.map(log =>
                log._id === call._id ? { ...log, isRead: true } : log
            )
        );

        // API call to mark as read
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_BASE_URL}/api/v1/call-logs/${call._id}/mark-read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            // Revert on failure
            setCallLogs(prevLogs =>
                prevLogs.map(log =>
                    log._id === call._id ? { ...log, isRead: false } : log
                )
            );
            console.error("Failed to mark call as read on server:", e);
            // Optionally show a toast message to the user
        }
    }
  };

  const renderContent = () => {
      if (isLoading) {
          return (
              <div className="call-log-list">
                  {[...Array(6)].map((_, i) => <CallLogItemSkeleton key={i} />)}
              </div>
          );
      }

      if (error) {
          return <div className="empty-history"><p>{error}</p></div>;
      }

      if (callLogs.length === 0) {
          return (
              <div className="empty-history">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <h3>لا توجد سجلات</h3>
                  <p>سيظهر هنا سجل شحناتك ومكالماتك المكتملة.</p>
              </div>
          );
      }

      return (
          <div className="call-log-list">
              {callLogs.map(call => (
                  <CallLogItem
                      key={call._id}
                      call={call}
                      currentUser={user}
                      onClick={() => handleItemClick(call)}
                  />
              ))}
          </div>
      );
  };

  return (
    <div className={`app-container history-container ${className || ''}`}>
      <header className="history-header">
        <h1>السجل</h1>
      </header>
      <main ref={contentRef} className="app-content history-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default HistoryScreen;
