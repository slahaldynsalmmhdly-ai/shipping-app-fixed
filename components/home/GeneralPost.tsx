import React from 'react';
import './GeneralPost.css'; // New CSS file
import '../home/ShipmentPost.css'; // Re-use some post styles
import { API_BASE_URL } from '../../config';
import PostActions from './PostActions';
import PostFooter from './PostFooter'; // New Import
import TruncatedText from '../shared/TruncatedText'; // New Import
import type { ToastType } from '../../App';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }
  if (url.startsWith('data:image') || url.startsWith('http')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

// Simplified renderer for embedded ads
const EmbeddedAd: React.FC<{ post: any }> = ({ post }) => {
    const isShipmentAd = post.pickupLocation; // A way to differentiate ad types

    return (
        <div className="embedded-ad-content">
             <div className="post-details">
                {isShipmentAd ? (
                    <>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:package-up.svg?color=%237f8c8d" alt="From icon" className="detail-icon" />
                            <div><span>من:</span> <strong>{post.pickupLocation}</strong></div>
                        </div>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:map-marker-radius-outline.svg?color=%237f8c8d" alt="To icon" className="detail-icon" />
                            <div><span>إلى:</span> <strong>{post.deliveryLocation}</strong></div>
                        </div>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:truck-outline.svg?color=%237f8c8d" alt="Truck icon" className="detail-icon" />
                            <div><span>الشاحنة:</span> <strong>{post.truckType}</strong></div>
                        </div>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:calendar-outline.svg?color=%237f8c8d" alt="Date icon" className="detail-icon" />
                            <div><span>التاريخ:</span> <strong>{new Date(post.pickupDate).toLocaleDateString('ar-SA')}</strong></div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:map-marker-outline.svg?color=%237f8c8d" alt="From icon" className="detail-icon" />
                            <div><span>الموقع:</span> <strong>{post.currentLocation}</strong></div>
                        </div>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:map-marker-radius-outline.svg?color=%237f8c8d" alt="To icon" className="detail-icon" />
                            <div><span>الوجهة:</span> <strong>{post.preferredDestination || 'غير محدد'}</strong></div>
                        </div>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:truck-outline.svg?color=%237f8c8d" alt="Truck icon" className="detail-icon" />
                            <div><span>الشاحنة:</span> <strong>{post.truckType}</strong></div>
                        </div>
                        <div className="detail-item">
                            <img src="https://api.iconify.design/mdi:calendar-outline.svg?color=%237f8c8d" alt="Date icon" className="detail-icon" />
                            <div><span>التوفر:</span> <strong>{new Date(post.availabilityDate).toLocaleDateString('ar-SA')}</strong></div>
                        </div>
                    </>
                )}
            </div>
            {(post.description || post.additionalNotes) && <TruncatedText text={post.description || post.additionalNotes} className="post-description" charLimit={100} />}
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
    );
};


const GeneralPost: React.FC<{ 
    post: any; 
    onOpenReportPost: () => void; 
    onOpenChat: () => void; 
    onOpenProfile: () => void; 
    isOwner?: boolean;
    onDeletePost?: () => void;
    onDismiss?: () => void;
    onEditPost: () => void; // New prop
    onRepost?: () => void; // New prop for reposting
    onOpenCommentSheet: () => void;
    user: any; // Logged-in user
    token: string | null;
    onShowToast: (message: string, type: ToastType) => void;
    onUpdateReactions: (newReactions: any[]) => void;
}> = ({ post, onOpenReportPost, onOpenChat, onOpenProfile, isOwner, onDeletePost, onDismiss, onEditPost, onRepost, onOpenCommentSheet, user, token, onShowToast, onUpdateReactions }) => {

    const handleShare = async () => {
        const shareData = {
            title: `منشور من ${post.companyName}`,
            text: post.text,
            url: window.location.href,
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

    const originalPost = post.originalPost;

    return (
        <div className="general-post shipment-post"> {/* Reuse shipment-post for base styling */}
            <header className="general-post-header">
                <div className="post-identity" onClick={onOpenProfile} role="button" tabIndex={0}>
                    <img src={post.avatar} alt={post.companyName} className="post-avatar" />
                    <div className="post-author-details">
                        <h4 className="post-company-name">{post.companyName}</h4>
                        <p className="post-time">{post.timeAgo}</p>
                    </div>
                </div>
                <PostActions
                    isOwner={isOwner || false}
                    onReport={onOpenReportPost}
                    onDelete={onDeletePost}
                    onDismiss={onDismiss}
                    onEdit={onEditPost}
                    reportText="الإبلاغ عن المنشور"
                    deleteText="حذف المنشور"
                />
            </header>
            <div className="general-post-body">
                {post.text && <TruncatedText text={post.text} className="post-text-content" charLimit={120} />}
                
                {originalPost ? (
                    <div className="embedded-post-container">
                        <header className="general-post-header embedded-header">
                             <div className="post-identity">
                                <img src={getFullImageUrl(originalPost.user.avatar)} alt={originalPost.user.name} className="post-avatar" />
                                <div className="post-author-details">
                                    <h4 className="post-company-name">{originalPost.user.name}</h4>
                                     <p className="post-time">{originalPost.pickupLocation ? 'إعلان عن حمولة' : 'إعلان شاحنة فارغة'}</p>
                                </div>
                            </div>
                        </header>
                        <EmbeddedAd post={originalPost} />
                    </div>
                ) : (
                    post.media && post.media.length > 0 && (
                        <div className="post-media-container">
                            {post.media[0].type === 'video' ? (
                                <video src={getFullImageUrl(post.media[0].url)} controls className="post-media-content" />
                            ) : (
                                <img src={getFullImageUrl(post.media[0].url)} alt="Post content" className="post-media-content" />
                            )}
                        </div>
                    )
                )}
            </div>
            <PostFooter 
                onComment={onOpenCommentSheet} 
                onShare={handleShare}
                onRepost={onRepost}
                postId={post.id}
                postType="post"
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

export default GeneralPost;
