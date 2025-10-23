import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import '../auth/Modal.css';
import './RepostModal.css';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any | null;
  user: any | null;
  onConfirm: (repostText: string) => void;
}

const RepostModal: React.FC<RepostModalProps> = ({ isOpen, onClose, post, user, onConfirm }) => {
  const [repostText, setRepostText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRepostText(''); // Reset text when modal opens
    }
  }, [isOpen]);
  
  // Auto-resize textarea
  useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
          textarea.style.height = 'auto';
          const scrollHeight = textarea.scrollHeight;
          textarea.style.height = `${scrollHeight}px`;
      }
  }, [repostText]);

  if (!isOpen || !post || !user) return null;

  const getPostTypeString = () => {
    if (post.from) return 'إعلان عن حمولة';
    if (post.currentLocation) return 'إعلان شاحنة فارغة';
    return 'منشور';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content repost-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="repost-modal-header">
          <button onClick={onClose} className="repost-action-btn" aria-label="إلغاء">إلغاء</button>
          <h2>إعادة نشر</h2>
          <button onClick={() => onConfirm(repostText)} className="repost-action-btn publish" aria-label="نشر">نشر</button>
        </header>
        <main className="repost-modal-body">
          <div className="repost-author-info">
            <img src={getFullImageUrl(user.avatar) || `https://ui-avatars.com/api/?name=${(user.name || '?').charAt(0)}&background=3498db&color=fff&size=128`} alt={user.name} className="repost-author-avatar" />
            <span className="repost-author-name">{user.name}</span>
          </div>
          <textarea
            ref={textareaRef}
            placeholder="أضف تعليقك هنا..."
            value={repostText}
            onChange={(e) => setRepostText(e.target.value)}
            rows={1}
            className="repost-textarea"
          />
          <div className="reposted-content-preview">
            <header className="reposted-content-header">
                <img src={post.avatar} alt={post.companyName} className="reposted-content-avatar" />
                <div className="reposted-content-author">
                    <h4>{post.companyName}</h4>
                    <p>{getPostTypeString()}</p>
                </div>
            </header>
             <div className="reposted-content-body full-preview">
                {/* General Post Text */}
                {post.text && <p className="repost-preview-text">{post.text}</p>}

                {/* Shipment Ad Details */}
                {post.from && (
                    <div className="repost-preview-details">
                        <p><strong>من:</strong> {post.from}</p>
                        <p><strong>إلى:</strong> {post.to}</p>
                    </div>
                )}

                {/* Empty Truck Ad Details */}
                {post.currentLocation && (
                     <div className="repost-preview-details">
                        <p><strong>الموقع الحالي:</strong> {post.currentLocation}</p>
                        <p><strong>الوجهة المفضلة:</strong> {post.preferredDestination || 'غير محدد'}</p>
                    </div>
                )}
                
                {/* Description for Ads */}
                {(post.description || post.additionalNotes) && <p className="repost-preview-text secondary">{post.description || post.additionalNotes}</p>}

                {/* Media */}
                {post.media && post.media.length > 0 && (
                    <div className="repost-preview-media">
                         {post.media[0].type === 'video' ? (
                            <video src={getFullImageUrl(post.media[0].url)} controls muted />
                        ) : (
                            <img src={getFullImageUrl(post.media[0].url)} alt="مرفق" />
                        )}
                    </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RepostModal;