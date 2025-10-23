import React, { useState, useEffect } from 'react';
import MediaUpload from '../shared/MediaUpload';
import '../auth/Modal.css'; // Reuse modal styles
import './Profile.css'; // Add specific review modal styles

const InteractiveStarRating: React.FC<{ rating: number; onRate: (rate: number) => void }> = ({ rating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="interactive-stars">
        {[...Array(5)].map((_, i) => {
            const rate = i + 1;
            return (
            <svg
                key={rate}
                viewBox="0 0 24 24"
                fill="currentColor"
                className={rate <= (hoverRating || rating) ? 'active' : ''}
                onClick={() => onRate(rate)}
                onMouseEnter={() => setHoverRating(rate)}
                onMouseLeave={() => setHoverRating(0)}
            >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            );
        })}
        </div>
    );
};


interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (reviewData: { rating: number; comment: string; media: string | null }) => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ isOpen, onClose, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setFormError(null);
      setMedia(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (rating === 0) {
        setFormError('يرجى تحديد تقييم بالنجوم.');
        return;
    }

    onReviewSubmit({
        rating,
        comment,
        media,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle-bar"></div>
        <h2>أضف تقييمك وتعليقك</h2>
        {formError && <p className="modal-error">{formError}</p>}
        <form onSubmit={handleFormSubmit} className="review-modal-content">
            <MediaUpload
                mediaPreview={media}
                setMediaPreview={setMedia}
                accept="image/*"
                uploadText="إضافة صورة (اختياري)"
                uploadSubText=""
            />
          <InteractiveStarRating rating={rating} onRate={setRating} />
          <textarea
            placeholder="اكتب تعليقك هنا لوصف تجربتك مع الشركة..."
            required
            aria-label="اكتب تعليقك"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <button type="submit" className="btn btn-primary modal-btn">
            إرسال التقييم
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;