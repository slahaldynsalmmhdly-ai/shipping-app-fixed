import React, { useMemo, useRef, useState, useEffect } from 'react';
import './PostFooter.css';
import { API_BASE_URL } from '../../config';
import type { ToastType } from '../../App';

interface PostFooterProps {
    onComment: () => void;
    onShare: () => void;
    onRepost?: () => void; // Make it optional and generic
    postId: string;
    postType: 'post' | 'shipmentAd' | 'emptyTruckAd';
    initialReactions?: any[];
    commentCount?: number;
    shareCount?: number;
    repostCount?: number;
    currentUserId?: string;
    token: string | null;
    onShowToast: (message: string, type: ToastType) => void;
    onUpdateReactions: (newReactions: any[]) => void;
}

const PostFooter: React.FC<PostFooterProps> = ({ 
    onComment, onShare, onRepost, postId, postType, initialReactions = [], 
    commentCount = 0, shareCount = 0, repostCount = 0,
    currentUserId, token, onShowToast, onUpdateReactions 
}) => {
    
    const debounceTimer = useRef<number | null>(null);
    const hasUserInteracted = useRef(false);

    const isLikedByMe = useMemo(() => {
        if (!currentUserId) return false;
        return initialReactions.some(r => {
            const userId = typeof r.user === 'string' ? r.user : r.user?._id;
            return userId === currentUserId;
        });
    }, [initialReactions, currentUserId]);

    const likeCount = useMemo(() => initialReactions.length, [initialReactions]);

    const [optimisticLiked, setOptimisticLiked] = useState(isLikedByMe);
    const [optimisticLikeCount, setOptimisticLikeCount] = useState(likeCount);

    // Sync local optimistic state with props when they change from the parent, unless the user has just interacted.
    useEffect(() => {
       if (!hasUserInteracted.current) {
           setOptimisticLiked(isLikedByMe);
           setOptimisticLikeCount(likeCount);
       }
    }, [isLikedByMe, likeCount]);

    // Reset the interaction flag when the component is used for a new post
    useEffect(() => {
       hasUserInteracted.current = false;
    }, [postId]);


    const handleLike = () => {
        if (!token || !currentUserId) {
            onShowToast('يجب تسجيل الدخول أولاً', 'error');
            return;
        }
        
        hasUserInteracted.current = true;

        // 1. Immediately update UI with optimistic state
        const newLikedState = !optimisticLiked;
        setOptimisticLiked(newLikedState);
        setOptimisticLikeCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);

        // 2. Clear any pending API call to debounce
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // 3. Set a new timer to make the API call
        debounceTimer.current = window.setTimeout(async () => {
            try {
                let endpoint = '';
                if (postType === 'post') {
                    endpoint = `${API_BASE_URL}/api/v1/posts/${postId}/react`;
                } else if (postType === 'emptyTruckAd') {
                    endpoint = `${API_BASE_URL}/api/v1/emptytruckads/${postId}/react`;
                } else if (postType === 'shipmentAd') {
                    endpoint = `${API_BASE_URL}/api/v1/shipmentads/${postId}/react`;
                }

                if (!endpoint) throw new Error("Invalid post type");

                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reactionType: 'like' }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'فشل التفاعل مع المنشور.' }));
                    throw new Error(errorData.message);
                }

                // After a successful API call, just reset the interaction flag.
                // We are no longer re-syncing from the server response to prevent flickers.
                // The UI will rely on the optimistic state until the parent component forces a props update.
                hasUserInteracted.current = false; 

            } catch (error: any) {
                // On failure, show an error but DO NOT revert the UI.
                // The user's optimistic state remains, and they can try again if they wish.
                onShowToast(error.message || 'حدث خطأ ما', 'error');
            }
        }, 500); // 500ms debounce window
    };

    const stats = [
        { count: optimisticLikeCount, label: 'إعجاب' },
        { count: commentCount, label: 'تعليقات' },
        { count: shareCount, label: 'مشاركة' },
        { count: repostCount, label: 'إعادة نشر' }
    ].filter(stat => stat.count > 0);

    return (
        <div className="post-footer">
            <div className="post-stats">
                {stats.map(stat => (
                    <div key={stat.label} className="stat-item">
                        <span className="stat-count">{stat.count}</span>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>
            <div className="post-footer-actions">
                <button className={`footer-action-btn ${optimisticLiked ? 'liked' : ''}`} onClick={handleLike}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>إعجاب</span>
                </button>
                <button className="footer-action-btn" onClick={onComment}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    <span>تعليق</span>
                </button>
                <button className="footer-action-btn" onClick={onRepost} disabled={!onRepost}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348L21 14.325l-4.977 4.977M21 14.325H3M7.977 4.675L3 9.652l4.977 4.977M3 9.652h18" />
                    </svg>
                    <span>إعادة</span>
                </button>
                <button className="footer-action-btn" onClick={onShare}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                    <span>مشاركة</span>
                </button>
            </div>
        </div>
    );
};

export default PostFooter;