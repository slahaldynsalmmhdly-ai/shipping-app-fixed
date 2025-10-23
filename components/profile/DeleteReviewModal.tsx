import React, { useState, useEffect } from 'react';
import '../auth/Modal.css';
import './DeleteReviewModal.css';
import { API_BASE_URL } from '../../config';

interface DeleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: any | null;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DeleteReviewModal: React.FC<DeleteReviewModalProps> = ({ isOpen, onClose, review, onShowToast }) => {
  const [reason, setReason] = useState('');
  const [isOtherReasonSheetOpen, setIsOtherReasonSheetOpen] = useState(false);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setIsOtherReasonSheetOpen(false);
      setOtherReasonText('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const reasons = [
    'تعليق غير مرغوب فيه أو إسبام',
    'محتوى يحض على الكراهية أو عنيف',
    'مضايقة أو تنمر',
    'معلومات زائفة',
    'سبب آخر'
  ];

  const submitDeletionRequest = async (selectedReason: string, otherText: string) => {
    if (!review?._id) {
      onShowToast('خطأ: لم يتم العثور على التقييم', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        onShowToast('يجب تسجيل الدخول أولاً', 'error');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reviews/${review._id}/delete-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: selectedReason,
          otherReasonText: otherText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل إرسال طلب الحذف');
      }

      onShowToast('تم إرسال طلب حذف التقييم بنجاح. سيتم مراجعته قريباً.', 'success');
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting deletion request:', error);
      onShowToast(error.message || 'حدث خطأ أثناء إرسال الطلب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reason) return;
    
    if (reason === 'سبب آخر') {
      setIsOtherReasonSheetOpen(true);
      return;
    }
    
    await submitDeletionRequest(reason, '');
  };

  const handleSendOtherReason = async () => {
    if (!otherReasonText.trim()) return;
    
    await submitDeletionRequest(reason, otherReasonText);
    setIsOtherReasonSheetOpen(false);
  };


  const renderOtherReasonSheet = () => (
    <div className="other-reason-sheet-overlay" onClick={() => setIsOtherReasonSheetOpen(false)}>
        <div className="other-reason-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle-bar"></div>
            <h3>اكتب سببك</h3>
            <textarea 
                placeholder="يرجى توضيح سبب الحذف..."
                value={otherReasonText}
                onChange={(e) => setOtherReasonText(e.target.value)}
                autoFocus
                rows={4}
            />
            <button 
                className="other-reason-send-btn" 
                disabled={!otherReasonText.trim() || isSubmitting}
                onClick={handleSendOtherReason}
                aria-label="إرسال"
            >
              {isSubmitting ? '...' : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </button>
        </div>
    </div>
  );

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-handle-bar"></div>
          <h2>سبب حذف التقييم</h2>
          <p className="modal-subtitle">سيتم إرسال هذا التقييم للمراجعة قبل الحذف. هذا الإجراء لا يمكن التراجع عنه.</p>
          
          <div className="delete-reason-list">
            {reasons.map(r => (
              <button 
                key={r}
                className={`reason-btn ${reason === r ? 'selected' : ''}`}
                onClick={() => setReason(r)}
                disabled={isSubmitting}
              >
                {r}
              </button>
            ))}
          </div>
          
          <button 
            className="btn btn-danger modal-btn" 
            disabled={!reason || isSubmitting}
            onClick={handleSubmitReview}
          >
            {isSubmitting ? 'جارٍ الإرسال...' : 'تقديم مراجعة للحذف'}
          </button>
        </div>
      </div>
      {isOtherReasonSheetOpen && renderOtherReasonSheet()}
    </>
  );
};

export default DeleteReviewModal;