import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import type { Screen, ToastType, UiComment, ConfirmationModalConfig } from '../../App';

import GeneralPost from '../home/GeneralPost';
import ShipmentPost from '../home/ShipmentPost';
import EmptyTruckAdPost from '../home/EmptyTruckAdPost';
import RepostedPost from '../home/RepostedPost';
import ShipmentPostSkeleton from '../home/ShipmentPostSkeleton';
import CommentSection from '../comments/CommentSection';

import './NotificationDetailScreen.css';

// Helper function to construct full image URLs
const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const timeAgo = (dateString: string) => {
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
    return `قبل ثوانٍ`;
};

interface NotificationDetailScreenProps {
    className?: string;
    onNavigateBack: () => void;
    post: { _id: string; text: string } | null;
    user: any;
    onShowToast: (message: string, type: ToastType) => void;
    onCommentChange: (updatedPost: any) => void;
    commentsCache: Map<string, UiComment[]>;
    setCommentsCache: React.Dispatch<React.SetStateAction<Map<string, UiComment[]>>>;
    onOpenReportProfile: (user: any) => void;
    onOpenConfirmationModal: (config: Omit<ConfirmationModalConfig, 'isOpen'>) => void;
    onOpenOtherProfile: (user: any) => void;
    onOpenRepostModal: (post: any) => void;
    onOpenEditPost: (post: any, origin: Screen) => void;
    addDeletedItemId: (itemId: string) => void;
    postsCache: Map<string, any>;
    setPostsCache: React.Dispatch<React.SetStateAction<Map<string, any>>>;
}

const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = (props) => {
    const { className, onNavigateBack, post: postSnippet, user, postsCache, setPostsCache } = props;
    const [fullPost, setFullPost] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isActive = className?.includes('page-active');

    useEffect(() => {
        if (!isActive || !postSnippet) {
            setFullPost(null); // Clear post data when screen is not active
            return;
        }

        const postId = postSnippet._id;
        const cachedPost = postsCache.get(postId);

        // Check cache first
        if (cachedPost) {
            setFullPost(cachedPost);
            setIsLoading(false);
            setError(null);
            return;
        }

        const fetchFullPost = async () => {
            setIsLoading(true);
            setError(null);
            setFullPost(null);

            const token = localStorage.getItem('authToken');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const fetchWithIdentifier = async (endpoint: string, type: string) => {
                const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
                if (!res.ok) throw new Error(`Failed to fetch from ${type}`);
                const data = await res.json();
                return { ...data, type }; // Add type identifier to the result
            };
            
            // FIX: Promise.any is not supported in all build environments. Replaced with
            // a more compatible Promise.all approach to find the first successful fetch.
            // FIX: Added callback function to .catch() to handle promise rejections correctly.
            const promises = [
                fetchWithIdentifier(`/api/v1/posts/${postSnippet._id}`, 'general').catch(() => null),
                fetchWithIdentifier(`/api/v1/shipmentads/${postSnippet._id}`, 'shipmentAd').catch(() => null),
                fetchWithIdentifier(`/api/v1/emptytruckads/${postSnippet._id}`, 'emptyTruckAd').catch(() => null)
            ];

            try {
                const results = await Promise.all(promises);
                const result = results.find(r => r);

                if (result) {
                    setFullPost(result);
                    // Store in cache on success
                    setPostsCache(prevCache => new Map(prevCache).set(postId, result));
                } else {
                    throw new Error("All post fetches failed.");
                }
            } catch (e) {
                console.error("Failed to fetch post from all endpoints:", e);
                setError('لم يتم العثور على المنشور أو قد يكون تم حذفه.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFullPost();

    }, [isActive, postSnippet, postsCache, setPostsCache]);

    const renderPostComponent = () => {
        if (isLoading) {
            return <ShipmentPostSkeleton />;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (!fullPost) {
            return null;
        }

        const token = localStorage.getItem('authToken');
        const isOwner = user && fullPost.user && user._id === fullPost.user._id;

        if (fullPost.type === 'general') {
            const mappedPost = { ...fullPost, id: fullPost._id, companyName: fullPost.user.name, avatar: getFullImageUrl(fullPost.user.avatar), timeAgo: timeAgo(fullPost.createdAt) };
             if (fullPost.isRepost && fullPost.originalPost) {
                return <RepostedPost post={mappedPost} isOwner={isOwner} onDeletePost={() => {}} onOpenReportPost={() => {}} onOpenChat={() => {}} onOpenProfile={() => props.onOpenOtherProfile(fullPost.user)} onOpenCommentSheet={() => {}} user={user} token={token} onShowToast={props.onShowToast} onUpdateReactions={() => {}} />
            }
            return <GeneralPost post={mappedPost} isOwner={isOwner} onDeletePost={() => {}} onEditPost={() => {}} onRepost={() => props.onOpenRepostModal(mappedPost)} onOpenReportPost={() => {}} onOpenChat={() => {}} onOpenProfile={() => props.onOpenOtherProfile(fullPost.user)} onOpenCommentSheet={() => {}} user={user} token={token} onShowToast={props.onShowToast} onUpdateReactions={() => {}} />;
        }
        if (fullPost.type === 'shipmentAd') {
            const mappedAd = { ...fullPost, id: fullPost._id, companyName: fullPost.user.name, avatar: getFullImageUrl(fullPost.user.avatar), timeAgo: timeAgo(fullPost.createdAt), from: fullPost.pickupLocation, to: fullPost.deliveryLocation, date: new Date(fullPost.pickupDate).toLocaleDateString('en-GB') };
            return <ShipmentPost post={mappedAd} isOwner={isOwner} onDeletePost={() => {}} onEditPost={() => {}} onRepost={() => props.onOpenRepostModal(mappedAd)} onOpenReportPost={() => {}} onOpenChat={() => {}} onOpenProfile={() => props.onOpenOtherProfile(fullPost.user)} onOpenCommentSheet={() => {}} user={user} token={token} onShowToast={props.onShowToast} onUpdateReactions={() => {}} />;
        }
        if (fullPost.type === 'emptyTruckAd') {
            const mappedAd = { ...fullPost, id: fullPost._id, companyName: fullPost.user.name, avatar: getFullImageUrl(fullPost.user.avatar), timeAgo: timeAgo(fullPost.createdAt), availabilityDate: new Date(fullPost.availabilityDate).toLocaleDateString('en-GB') };
            return <EmptyTruckAdPost post={mappedAd} isOwner={isOwner} onDeletePost={() => {}} onEditPost={() => {}} onRepost={() => props.onOpenRepostModal(mappedAd)} onOpenReportPost={() => {}} onOpenChat={() => {}} onOpenProfile={() => props.onOpenOtherProfile(fullPost.user)} onOpenCommentSheet={() => {}} user={user} token={token} onShowToast={props.onShowToast} onUpdateReactions={() => {}} />;
        }

        return <p className="error-message">نوع المنشور غير معروف.</p>;
    }


    return (
        <div className={`app-container notification-detail-container ${className || ''}`}>
            <header className="notification-detail-header">
                <button onClick={onNavigateBack} className="back-button" aria-label="الرجوع">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <h1>المنشور</h1>
            </header>
            <main className="app-content notification-detail-content">
                <div className="notification-detail-post-area">
                    {renderPostComponent()}
                </div>
                {fullPost && (
                    <CommentSection
                        post={fullPost}
                        user={props.user}
                        onShowToast={props.onShowToast}
                        onCommentChange={props.onCommentChange}
                        commentsCache={props.commentsCache}
                        setCommentsCache={props.setCommentsCache}
                        onOpenReportProfile={props.onOpenReportProfile}
                        onOpenConfirmationModal={props.onOpenConfirmationModal}
                    />
                )}
            </main>
        </div>
    );
};

export default NotificationDetailScreen;