import React from 'react';
import { API_BASE_URL } from '../../config';
import type { ToastType } from '../../App';
import PostFooter from './PostFooter';
import PostActions from './PostActions';
import TruncatedText from '../shared/TruncatedText';
import './RepostedPost.css';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const TimeSince: React.FC<{ date: string }> = ({ date }) => {
    if (!date) return null;
    const time = new Date(date).getTime();
    const now = new Date().getTime();
    const seconds = Math.floor((now - time) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return <span>{Math.floor(interval)} سنة</span>;
    interval = seconds / 2592000;
    if (interval > 1) return <span>{Math.floor(interval)} شهر</span>;
    interval = seconds / 86400;
    if (interval > 1) return <span>{Math.floor(interval)} يوم</span>;
    interval = seconds / 3600;
    if (interval > 1) return <span>{Math.floor(interval)} ساعة</span>;
    interval = seconds / 60;
    if (interval > 1) return <span>{Math.floor(interval)} دقيقة</span>;
    return <span>{Math.floor(seconds)} ثانية</span>;
};

const EmbeddedContent: React.FC<{ post: any }> = ({ post }) => {
    const isShipmentAd = !!post.pickupLocation;
    const isEmptyTruckAd = !!post.currentLocation;

    return (
        <div className="embedded-content-wrapper">
            {(isShipmentAd || isEmptyTruckAd) && (
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
                    ) : ( // Empty Truck Ad
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
            )}
            
            {(post.text || post.description || post.additionalNotes) && (
                <TruncatedText text={post.text || post.description || post.additionalNotes} className="post-description" charLimit={100} />
            )}
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


const RepostedContentPreview: React.FC<{ post: any }> = ({ post }) => {
    if (!post) return null;

    const isShipmentAd = !!post.pickupLocation;
    const isGeneralPost = !isShipmentAd && post.text;
    const isEmptyTruckAd = !isShipmentAd && !isGeneralPost && !!post.currentLocation;
    
    return (
        <div className="reposted-content-preview-inner">
            <header className="reposted-content-header">
                <img src={getFullImageUrl(post.user?.avatar) || `https://ui-avatars.com/api/?name=${(post.user?.name || '?').charAt(0)}&background=3498db&color=fff&size=128`} alt={post.user?.name} className="reposted-content-avatar" />
                <div className="reposted-content-author">
                    <h4>{post.user?.name || 'مستخدم غير معروف'}</h4>
                    <p>{isShipmentAd ? 'إعلان عن حمولة' : (isGeneralPost ? 'منشور عام' : 'إعلان شاحنة فارغة')} • <TimeSince date={post.createdAt} /></p>
                </div>
            </header>
            <EmbeddedContent post={post} />
        </div>
    );
};

interface RepostedPostProps {
  post: any; // The repost object
  onOpenReportPost: (post: any) => void;
  onOpenChat: (user: any) => void;
  onOpenProfile: (user: any) => void;
  isOwner: boolean;
  onDeletePost: () => void;
  onOpenCommentSheet: () => void;
  user: any;
  token: string | null;
  onShowToast: (message: string, type: ToastType) => void;
  onUpdateReactions: (newReactions: any[]) => void;
}

const RepostedPost: React.FC<RepostedPostProps> = ({ post, onOpenReportPost, onOpenChat, onOpenProfile, isOwner, onDeletePost, onOpenCommentSheet, user, token, onShowToast, onUpdateReactions }) => {
    const originalPost = post.originalPost;

    const handleShare = async () => {
        try {
            await navigator.share({ title: 'مشاركة من تطبيق الشحن', text: `شاهد هذا المنشور من ${post.user.name}`, url: window.location.href });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <article className="general-post shipment-post reposted-post-card">
            <header className="general-post-header">
                <div className="post-identity" onClick={() => onOpenProfile(post.user)}>
                    <img
                        src={getFullImageUrl(post.user.avatar) || `https://ui-avatars.com/api/?name=${(post.user.name || '?').charAt(0)}&background=3498db&color=fff&size=128`}
                        alt={post.user.name}
                        className="post-avatar"
                    />
                    <div className="post-author-details">
                        <h4 className="post-company-name">{post.user.name}</h4>
                        <p className="post-time"><TimeSince date={post.createdAt} /></p>
                    </div>
                </div>
                 <PostActions
                    isOwner={isOwner}
                    onReport={() => onOpenReportPost(post)}
                    onDelete={onDeletePost}
                    reportText="الإبلاغ عن المنشور"
                    deleteText="حذف المنشور"
                />
            </header>
            
            <div className="post-content">
                {post.text && <p className="repost-comment">{post.text}</p>}
                <div className="reposted-content-container">
                    <RepostedContentPreview post={originalPost} />
                </div>
            </div>

            <PostFooter
                onComment={onOpenCommentSheet}
                onShare={handleShare}
                // Reposting a repost is disabled for now
                postId={post._id}
                postType={'post'} // Reposts are always of type 'post'
                initialReactions={post.reactions || []}
                commentCount={post.comments?.length || 0}
                shareCount={post.shareCount || 0}
                repostCount={0} // Reposts of reposts are disabled
                currentUserId={user?._id}
                token={token}
                onShowToast={onShowToast}
                // FIX: Pass the onUpdateReactions prop directly. The parent component already knows the post ID.
                onUpdateReactions={onUpdateReactions}
            />
        </article>
    );
};

export default RepostedPost;
