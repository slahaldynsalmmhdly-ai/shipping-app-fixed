import React from 'react';
import './ShipmentPost.css';
import { API_BASE_URL } from '../../config';
import PostActions from './PostActions';
import PostFooter from './PostFooter'; // New Import
import TruncatedText from '../shared/TruncatedText'; // New Import
import type { ToastType } from '../../App';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const ShipmentPost: React.FC<{ 
    post: any; 
    onOpenReportPost: () => void; 
    onOpenChat: () => void; 
    onOpenProfile: () => void; 
    isOwner?: boolean;
    onDeletePost?: () => void;
    onDismiss?: () => void;
    onEditPost: () => void; 
    onRepost?: () => void;
    onOpenCommentSheet: () => void;
    user: any; // Logged-in user
    token: string | null;
    onShowToast: (message: string, type: ToastType) => void;
    onUpdateReactions: (newReactions: any[]) => void;
}> = ({ post, onOpenReportPost, onOpenChat, onOpenProfile, isOwner, onDeletePost, onDismiss, onEditPost, onRepost, onOpenCommentSheet, user, token, onShowToast, onUpdateReactions }) => {

    const handleShare = async () => {
        const shareData = {
            title: `إعلان شحن: ${post.from} إلى ${post.to}`,
            text: `إعلان شحن من ${post.companyName}: حمولة ${post.truckType} من ${post.from} إلى ${post.to}. التفاصيل: ${post.description || 'لا يوجد'}`,
            url: window.location.href, // Or a specific post URL if available
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert('المشاركة غير مدعومة في هذا المتصفح.');
            }
        } catch (err) {
            console.error("Error sharing post:", err);
        }
    };


    return (
        <div className="general-post shipment-post">
            <header className="general-post-header">
                <div className="post-identity" onClick={onOpenProfile} role="button" tabIndex={0}>
                    <img src={post.avatar} alt={post.companyName} className="post-avatar" />
                    <div className="post-author-details">
                        <h4 className="post-company-name">{post.companyName}</h4>
                        <p className="post-time">إعلان عن حمولة • {post.timeAgo}</p>
                    </div>
                </div>
                <PostActions
                    isOwner={isOwner || false}
                    onReport={onOpenReportPost}
                    onDelete={onDeletePost}
                    onDismiss={onDismiss}
                    onEdit={onEditPost}
                    reportText="الإبلاغ عن الإعلان"
                    deleteText="حذف الإعلان"
                />
            </header>
            <div className="post-body">
            <div className="post-details">
                <div className="detail-item">
                <img src="https://api.iconify.design/mdi:package-up.svg?color=%237f8c8d" alt="From icon" className="detail-icon" />
                <div><span>من:</span> <strong>{post.from}</strong></div>
                </div>
                <div className="detail-item">
                <img src="https://api.iconify.design/mdi:map-marker-radius-outline.svg?color=%237f8c8d" alt="To icon" className="detail-icon" />
                <div><span>إلى:</span> <strong>{post.to}</strong></div>
                </div>
                <div className="detail-item">
                <img src="https://api.iconify.design/mdi:truck-outline.svg?color=%237f8c8d" alt="Truck icon" className="detail-icon" />
                <div><span>الشاحنة:</span> <strong>{post.truckType}</strong></div>
                </div>
                <div className="detail-item">
                <img src="https://api.iconify.design/mdi:calendar-outline.svg?color=%237f8c8d" alt="Date icon" className="detail-icon" />
                <div><span>التاريخ:</span> <strong>{post.date}</strong></div>
                </div>
            </div>
            {post.description && <TruncatedText text={post.description} className="post-description" charLimit={100} />}
            {post.media && post.media.length > 0 && (
                <div className="post-media-container">
                    {post.media[0].type === 'video' ? (
                        <video src={getFullImageUrl(post.media[0].url)} controls className="post-media-content" />
                    ) : (
                        <img src={getFullImageUrl(post.media[0].url)} alt="Post content" className="post-media-content" />
                    )}
                </div>
            )}
            </div>
            <PostFooter 
                onComment={onOpenCommentSheet} 
                onShare={handleShare}
                onRepost={onRepost}
                postId={post.id}
                postType="shipmentAd"
                initialReactions={post.reactions}
                commentCount={post.comments?.length || post.commentCount || 0}
                shareCount={post.shareCount || 0}
                repostCount={post.repostCount || 0}
                currentUserId={user?._id}
                token={token}
                onShowToast={onShowToast}
                onUpdateReactions={onUpdateReactions}
            />
        </div>
    );
};

export default ShipmentPost;
