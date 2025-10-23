import React, { useState, useEffect } from 'react';
import MediaUpload from '../shared/MediaUpload';
import './ReportPostScreen.css';
import { API_BASE_URL } from '../../config';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

interface ReportPostScreenProps {
  className?: string;
  onNavigateBack: () => void;
  post?: any; // In a real app, this would be a defined type
  user?: any; // Added to support reporting users
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ReportPostScreen: React.FC<ReportPostScreenProps> = ({ className, onNavigateBack, post, user, onShowToast }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loadingDate, setLoadingDate] = useState('');
  const [unloadingDate, setUnloadingDate] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const wordCount = details.trim().split(/\s+/).filter(Boolean).length;
  const isWordCountExceeded = wordCount > 50;
  
  // Logic to determine report target
  const isUserReport = !!user;
  const isReviewReport = !!post && !!post.author; // Reviews have an 'author' property
  const isPostReport = !!post && !isReviewReport; // Posts have a 'user' property

  let reportingTarget: any;
  let screenTitle: string;
  let reportType: 'post' | 'user' | 'review';
  let targetId: string | undefined;

  if (isUserReport) {
    reportType = 'user';
    targetId = user?._id || user?.id;
    reportingTarget = { companyName: user?.name, avatar: user?.avatarUrl };
    screenTitle = `الإبلاغ عن ${reportingTarget.companyName}`;
  } else if (isReviewReport) {
    reportType = 'review';
    targetId = post?._id || post?.id;
    reportingTarget = { 
        companyName: post.author.name, 
        avatar: getFullImageUrl(post.author.avatar) || `https://ui-avatars.com/api/?name=${(post.author.name || '?').charAt(0)}` 
    };
    screenTitle = 'الإبلاغ عن تقييم';
  } else { // isPostReport
    reportType = 'post';
    targetId = post?._id || post?.id;
    reportingTarget = post;
    screenTitle = 'الإبلاغ عن إعلان';
  }

  // Effect to reset state when the component is displayed for a new report
  useEffect(() => {
    // This will run when the component mounts or when the post/user props change,
    // effectively resetting the form each time the report screen is opened.
    setReason('');
    setDetails('');
    setLoadingDate('');
    setUnloadingDate('');
    setMediaPreview(null);
  }, [post, user]);

  useEffect(() => {
    const isValid = reason.trim() !== '' && details.trim() !== '' && !isWordCountExceeded;
    setIsFormValid(isValid);
  }, [reason, details, isWordCountExceeded]);

  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetails(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // --- IMMEDIATE FEEDBACK ---
    onShowToast('تم إرسال البلاغ بنجاح. سيتم مراجعته من قبل فريقنا.', 'success');
    onNavigateBack();

    // --- FIRE-AND-FORGET API CALL ---
    (async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('Report submission failed: No auth token');
          return;
        }
        if (!targetId) {
          console.error('Report submission failed: No target ID');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            reportType,
            targetId,
            reason,
            details,
            media: mediaPreview || '',
            loadingDate,
            unloadingDate
          })
        });
        
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            console.error('Failed to submit report:', data.message || 'Unknown error');
        } else {
            console.log("Report submitted successfully in the background.");
        }
        
      } catch (error: any) {
        console.error('Error submitting report in background:', error);
      }
    })();
  };

  if (!post && !user) {
      return null;
  }
  
  const getReportTargetText = () => {
    if (isPostReport) return 'إعلان من';
    if (isReviewReport) return 'تقييم من';
    return '';
  }

  return (
    <div className={`app-container report-post-container ${className || ''}`}>
      <form className="report-problem-form-wrapper" onSubmit={handleSubmit} id="report-post-form">
        <header className="report-problem-header">
          <button type="button" onClick={onNavigateBack} className="header-action-btn back-btn" aria-label="الرجوع">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h1>{screenTitle}</h1>
          <button type="submit" form="report-post-form" className="header-action-btn send-btn" disabled={!isFormValid} aria-label="إرسال">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </header>
        <main className="app-content report-problem-content">
          <div className="reported-post-info">
            <img src={reportingTarget.avatar} alt={reportingTarget.companyName} />
            <p>أنت تبلغ عن {getReportTargetText()} <strong>{reportingTarget.companyName}</strong></p>
          </div>

          <MediaUpload mediaPreview={mediaPreview} setMediaPreview={setMediaPreview} />
          
          <div className="form-group select-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              <select id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)} required>
                  <option value="" disabled>اختر سبب الإبلاغ...</option>
                  <option value="scam">احتيال أو معلومات مضللة</option>
                  <option value="inappropriate">محتوى غير لائق أو مسيء</option>
                  <option value="spam">إعلان متكرر أو مزعج</option>
                  <option value="communication_issue">مشكلة في التواصل</option>
                  <option value="other">سبب آخر (يرجى التوضيح)</option>
              </select>
          </div>

          <div className="form-group-textarea report-description-box">
            <div className="form-group-textarea-header">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <label htmlFor="problem-details">إضافة تفاصيل</label>
            </div>
            <textarea
              id="problem-details"
              rows={4}
              placeholder="يرجى وصف المشكلة هنا..."
              required
              value={details}
              onChange={handleDetailsChange}
              aria-describedby="word-count-helper"
            ></textarea>
            <div id="word-count-helper" className={`word-counter ${isWordCountExceeded ? 'exceeded' : ''}`}>
              {wordCount}/50 كلمة
            </div>
          </div>
          
          {isPostReport && (
            <>
              <h3 className="form-section-title">التاريخ (اختياري)</h3>
              <div className="form-row">
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>
                        <input type="text" placeholder="تاريخ التحميل" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} aria-label="تاريخ التحميل" value={loadingDate} onChange={(e) => setLoadingDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>
                        <input type="text" placeholder="تاريخ التنزيل" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} aria-label="تاريخ التنزيل" value={unloadingDate} onChange={(e) => setUnloadingDate(e.target.value)} />
                    </div>
                </div>
            </>
          )}
        </main>
      </form>
    </div>
  );
};

export default ReportPostScreen;
