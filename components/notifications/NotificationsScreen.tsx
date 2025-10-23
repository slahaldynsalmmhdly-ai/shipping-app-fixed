

import React from 'react';
import { API_BASE_URL } from '../../config';
import './NotificationsScreen.css';
import type { Notification } from '../../App';

// Helper function to construct full image URLs
const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

// New Component for placeholder avatars with gradients
const PlaceholderAvatar: React.FC<{ name: string; className: string }> = ({ name, className }) => {
    const getInitials = (nameStr: string) => {
        const parts = (nameStr || '').split(' ');
        if (parts.length > 1) {
            return (parts[0][0] || '') + (parts[parts.length - 1][0] || '');
        }
        return (nameStr || '?').substring(0, 2);
    };

    const getHashOfString = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };
    
    const getGradientColors = (str: string) => {
        const hash = getHashOfString(str);
        const hue = Math.abs(hash % 360);
        const color1 = `hsl(${hue}, 70%, 50%)`;
        const color2 = `hsl(${(hue + 45) % 360}, 70%, 60%)`;
        return { color1, color2 };
    };

    const initials = getInitials(name).toUpperCase();
    const { color1, color2 } = getGradientColors(name);
    const gradientId = `grad-${name.replace(/\s/g, '')}`;

    return (
        <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: color1 }} />
                    <stop offset="100%" style={{ stopColor: color2 }} />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
            <text x="50" y="50" textAnchor="middle" dy=".3em" fill="white" fontSize="40" fontWeight="bold">
                {initials}
            </text>
        </svg>
    );
};


// New, more detailed time formatting function
const formatDetailedTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    const timeString = new Intl.DateTimeFormat('ar-SA', timeOptions).format(date);

    if (date >= today) {
        return `اليوم، ${timeString}`;
    } else if (date >= yesterday) {
        return `أمس، ${timeString}`;
    } else {
        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        const dateStringFormatted = new Intl.DateTimeFormat('ar-SA', dateOptions).format(date);
        return `${dateStringFormatted}، ${timeString}`;
    }
};


const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  switch (type) {
    case 'like':
    case 'comment_like':
    case 'reply_like':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      );
    case 'comment':
    case 'reply':
       return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 1.76.566 3.425 1.518 4.786l-1.518 1.518a.75.75 0 101.06 1.061l1.518-1.518C7.26 15.434 8.61 16 10 16c4.418 0 8-3.134 8-7s-3.582-7-8-7z" clipRule="evenodd" />
        </svg>
       );
    default:
      return (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
         </svg>
      );
  }
};

const NotificationSkeletonItem: React.FC = () => (
    <li className="notification-item skeleton-item">
        <div className="notification-icon-wrapper skeleton">
            {/* These inner divs are just for styling, no content */}
            <div className="skeleton-avatar-inner"></div>
            <div className="skeleton-type-icon"></div>
        </div>
        <div className="notification-details">
            <div className="skeleton skeleton-line name"></div>
            <div className="skeleton skeleton-line snippet"></div>
            <div className="skeleton skeleton-line time"></div>
        </div>
    </li>
);

interface NotificationsScreenProps {
  className?: string;
  onNavigateBack: () => void;
  notifications: Notification[] | null;
  isLoading: boolean;
  error: string | null;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[] | null>>;
  onOpenNotificationDetail: (post: any) => void;
}

const renderNotificationText = (notif: Notification) => {
    switch (notif.type) {
        case 'like':
            return (
                <>
                    <p className="notification-description">
                        <strong>{notif.sender.name}</strong>
                        <span> أعجب بمنشورك</span>
                    </p>
                    {notif.post.text && <p className="post-snippet-text">{notif.post.text}</p>}
                </>
            );
        case 'comment':
            return (
                <>
                    <p className="notification-description">
                        <strong>{notif.sender.name}</strong>
                        <span> علّق على منشورك</span>
                    </p>
                    {notif.comment?.text && <p className="post-snippet-text">{notif.comment.text}</p>}
                </>
            );
        case 'reply':
            return (
                <>
                    <p className="notification-description">
                        <strong>{notif.sender.name}</strong>
                        <span> رد على تعليقك</span>
                    </p>
                    {notif.reply?.text && <p className="post-snippet-text">{notif.reply.text}</p>}
                </>
            );
        case 'comment_like':
             return (
                <>
                    <p className="notification-description">
                        <strong>{notif.sender.name}</strong>
                        <span> أعجب بتعليقك</span>
                    </p>
                    {notif.comment?.text && <p className="post-snippet-text">{notif.comment.text}</p>}
                </>
            );
        case 'reply_like':
            return (
                <>
                    <p className="notification-description">
                        <strong>{notif.sender.name}</strong>
                        <span> أعجب بردك</span>
                    </p>
                    {notif.reply?.text && <p className="post-snippet-text">{notif.reply.text}</p>}
                </>
            );
        default:
            const exhaustiveCheck: never = notif.type;
            return <p>إشعار جديد.</p>;
    }
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ 
    className, 
    onNavigateBack, 
    notifications,
    isLoading,
    error,
    setNotifications,
    onOpenNotificationDetail,
}) => {

  const handleNotificationClick = async (notification: Notification) => {
    // Navigate to the detail screen
    onOpenNotificationDetail(notification.post);
    
    // Perform optimistic update and backend sync if unread
    if (!notification.read) {
        // Optimistic UI update for instant feedback on the item itself.
        setNotifications(prev => {
            if (!prev) return null;
            return prev.map(n => (n._id === notification._id ? { ...n, read: true } : n))
        });

        // Fire-and-forget API call to mark as read on the backend for robustness.
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
          await fetch(`${API_BASE_URL}/api/v1/users/me/notifications/${notification._id}/read`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          console.error("Failed to mark notification as read on backend:", error);
          // Optional: Add logic here to revert the optimistic update if needed
        }
    }
  };

  const renderContent = () => {
    if (isLoading || notifications === null) {
      return (
        <ul className="notifications-list">
          {[...Array(5)].map((_, i) => <NotificationSkeletonItem key={i} />)}
        </ul>
      );
    }

    if (error) {
        return <div className="empty-notifications"><p>{error}</p></div>
    }

    if (notifications.length === 0) {
      return (
        <div className="empty-notifications">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <h3>لا توجد إشعارات</h3>
          <p>سنعلمك عندما يكون هناك جديد.</p>
        </div>
      );
    }
    
    return (
        <ul className="notifications-list">
            {notifications.map((notif) => (
              <li 
                key={notif._id} 
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="notification-icon-wrapper">
                    {notif.sender.avatar ? (
                        <img src={getFullImageUrl(notif.sender.avatar)} alt={notif.sender.name} className="notification-avatar" />
                    ) : (
                        <PlaceholderAvatar name={notif.sender.name} className="notification-avatar" />
                    )}
                    <div className="notification-type-icon">
                        <NotificationIcon type={notif.type} />
                    </div>
                </div>
                <div className="notification-details">
                    {renderNotificationText(notif)}
                    <p className="notification-time">{formatDetailedTime(notif.createdAt)}</p>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </li>
            ))}
        </ul>
    );
  };

  return (
    <div className={`app-container notifications-container ${className || ''}`}>
      <header className="notifications-header">
        <button onClick={onNavigateBack} className="back-button" aria-label="الرجوع">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <h1>الإشعارات</h1>
      </header>
      <main className="app-content notifications-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default NotificationsScreen;