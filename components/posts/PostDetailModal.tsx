import React from 'react';
import './PostDetailModal.css';
import '../auth/Modal.css'; // Re-use modal styles
import GeneralPost from '../home/GeneralPost';
import ShipmentPost from '../home/ShipmentPost';
import EmptyTruckAdPost from '../home/EmptyTruckAdPost';
import RepostedPost from '../home/RepostedPost';
import { API_BASE_URL } from '../../config';
import type { Screen, ToastType } from '../../App';

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

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  user: any;
  onOpenReportPost: (post: any) => void;
  onOpenOtherProfile: (user: any) => void;
  onOpenChat: (user: any) => void;
  onOpenCommentSheet: (post: any) => void;
  onOpenRepostModal: (post: any) => void;
  onOpenEditPost: (post: any, origin: Screen) => void;
  onOpenConfirmationModal: (config: { title: string, message: string, onConfirm: () => void, confirmButtonText?: string; }) => void;
  addDeletedItemId: (itemId: string) => void;
  onShowToast: (message: string, type: ToastType) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = (props) => {
  const { isOpen, onClose, post, user } = props;

  if (!isOpen || !post) return null;

  const token = localStorage.getItem('authToken');
  const isOwner = user && post.user && user._id === post.user._id;

  const handleDelete = () => {
    props.onOpenConfirmationModal({
        title: 'تأكيد الحذف',
        message: 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmButtonText: 'نعم، احذف',
        onConfirm: async () => {
            const itemType = post.type;
            const itemId = post._id;
            let endpoint = '';
            if (itemType === 'general' || itemType === 'post' || post.isRepost) {
                endpoint = `${API_BASE_URL}/api/v1/posts/${itemId}`;
            } else if (itemType === 'shipmentAd') {
                endpoint = `${API_BASE_URL}/api/v1/shipmentads/${itemId}`;
            } else if (itemType === 'emptyTruckAd') {
                endpoint = `${API_BASE_URL}/api/v1/emptytruckads/${itemId}`;
            }

            try {
                if (!token) throw new Error('Authentication error');
                const res = await fetch(endpoint, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok) throw new Error('Failed to delete item');
                props.addDeletedItemId(itemId);
                props.onShowToast('تم الحذف بنجاح', 'success');
                onClose();
            } catch (e: any) {
                props.onShowToast(e.message || 'فشل الحذف', 'error');
            }
        }
    });
};

  const renderPostComponent = () => {
    // Map the post data to the format expected by the Post components
    const commonProps = {
        isOwner,
        user,
        token,
        onDeletePost: handleDelete,
        onOpenReportPost: () => props.onOpenReportPost(post),
        onOpenChat: () => props.onOpenChat(post.user),
        onOpenProfile: () => props.onOpenOtherProfile(post.user),
        onOpenCommentSheet: () => { onClose(); props.onOpenCommentSheet(post); },
        onRepost: () => props.onOpenRepostModal(post),
        onEditPost: () => props.onOpenEditPost(post, 'profileIndividual'),
        onShowToast: props.onShowToast,
        onUpdateReactions: () => { /* In-modal reaction state is temporary */ },
    };

    const postType = post.type || (post.pickupLocation ? 'shipmentAd' : (post.currentLocation ? 'emptyTruckAd' : 'general'));

    if (postType === 'general' || post.isRepost) {
        const mappedPost = {
            ...post,
            id: post._id,
            companyName: post.user.name,
            avatar: getFullImageUrl(post.user.avatar),
            timeAgo: timeAgo(post.createdAt),
        };
        if (post.isRepost) {
             return <RepostedPost post={mappedPost} {...commonProps} />;
        }
        return <GeneralPost post={mappedPost} {...commonProps} />;
    }
    if (postType === 'shipmentAd') {
        const mappedAd = {
            ...post,
            id: post._id,
            companyName: post.user.name,
            avatar: getFullImageUrl(post.user.avatar),
            timeAgo: timeAgo(post.createdAt),
            from: post.pickupLocation,
            to: post.deliveryLocation,
            date: new Date(post.pickupDate).toLocaleDateString('ar-SA'),
        };
        return <ShipmentPost post={mappedAd} {...commonProps} />;
    }
    if (postType === 'emptyTruckAd') {
        const mappedAd = {
            ...post,
            id: post._id,
            companyName: post.user.name,
            avatar: getFullImageUrl(post.user.avatar),
            timeAgo: timeAgo(post.createdAt),
            availabilityDate: new Date(post.availabilityDate).toLocaleDateString('ar-SA'),
        };
        return <EmptyTruckAdPost post={mappedAd} {...commonProps} />;
    }
    return <p>نوع المنشور غير معروف.</p>;
  };

  return (
    <div className="modal-overlay post-detail-overlay" onClick={onClose}>
      <div className="post-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="post-detail-modal-header">
            <button onClick={onClose} className="close-detail-btn" aria-label="إغلاق">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </header>
        <main className="post-detail-modal-body">
            {renderPostComponent()}
        </main>
      </div>
    </div>
  );
};

export default PostDetailModal;
