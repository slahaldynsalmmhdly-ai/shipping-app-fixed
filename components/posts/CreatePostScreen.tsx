import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import './CreatePostScreen.css';

// Helper function to construct full image URLs
const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};


// Action Sheet component, similar to Facebook's "Add to your post"
const PostActionSheet: React.FC<{
  onClose: () => void;
  onAddMedia: () => void;
}> = ({ onClose, onAddMedia }) => (
  <div className="post-action-sheet-overlay" onClick={onClose}>
    <div className="post-action-sheet-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-handle-bar"></div>
      <h4>إضافة إلى منشورك</h4>
      <button type="button" className="action-sheet-item" onClick={onAddMedia}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span>صورة/فيديو</span>
      </button>
       <button type="button" className="action-sheet-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
        <span>الإشارة لأشخاص</span>
      </button>
      <button type="button" className="action-sheet-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
           <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span>الموقع</span>
      </button>
    </div>
  </div>
);


interface CreatePostScreenProps {
  className?: string;
  onNavigateBack: () => void;
  onPostCreated: (postData: { text: string; mediaFile: File | null; }) => void;
  user: any;
  itemToEdit: any | null;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ className, onNavigateBack, onPostCreated, user, itemToEdit }) => {
  const [postText, setPostText] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isActionSheetOpen, setActionSheetOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!itemToEdit;
  const isFormValid = postText.trim() !== '' || mediaPreview !== null;

  useEffect(() => {
    if (isEditMode) {
      setPostText(itemToEdit.text || '');
      if (itemToEdit.media && itemToEdit.media.length > 0) {
        setMediaPreview(getFullImageUrl(itemToEdit.media[0].url));
        setMediaType(itemToEdit.media[0].type);
        setMediaFile(null); // User must re-upload to change
      }
    } else {
        setPostText('');
        setMediaPreview(null);
        setMediaType(null);
        setMediaFile(null);
    }
  }, [itemToEdit, isEditMode]);


  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto'; // Reset height
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
    }
  }, [postText]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onPostCreated({
      text: postText,
      mediaFile: mediaFile,
    });
  };

  const handleOpenActionSheet = () => setActionSheetOpen(true);
  const handleCloseActionSheet = () => setActionSheetOpen(false);
  
  const handleAddMediaClick = () => {
    handleCloseActionSheet();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaType(file.type.startsWith('image') ? 'image' : 'video');
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
      setMediaPreview(null);
      setMediaType(null);
      setMediaFile(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }
  
  const avatarUrl = getFullImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${(user?.name || '?').charAt(0)}&background=3498db&color=fff&size=128`;

  return (
    <div className={`app-container create-post-container ${className || ''}`}>
      <form className="create-post-form-wrapper" onSubmit={handleFormSubmit} id="create-post-form">
        <header className="create-post-header">
          <button type="button" onClick={onNavigateBack} className="post-header-btn close-btn" aria-label="إغلاق">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1>{isEditMode ? 'تعديل المنشور' : 'إنشاء منشور'}</h1>
          <button type="submit" form="create-post-form" className="post-header-btn publish-btn" disabled={!isFormValid} aria-label={isEditMode ? 'حفظ' : 'نشر'}>
            {isEditMode ? 'حفظ' : 'نشر'}
          </button>
        </header>
        <main className="app-content create-post-content">
          <div className="post-author-info">
            <img src={avatarUrl} alt={user?.name} className="post-author-avatar" />
            <div className="post-author-name">{user?.name}</div>
          </div>
          <textarea
            ref={textareaRef}
            placeholder={user ? `بماذا تفكر يا ${user.name}؟` : 'بماذا تفكر؟'}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={1}
            className="post-textarea"
          />
          {mediaPreview && (
            <div className="post-media-preview">
                 {mediaType === 'image' ? (
                    <img src={mediaPreview} alt="Preview" />
                 ) : (
                    <video src={mediaPreview} controls muted loop autoPlay playsInline />
                 )}
                 <button type="button" onClick={handleRemoveMedia} className="remove-media-btn" aria-label="إزالة الوسائط">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
            </div>
          )}
        </main>

        <footer className="create-post-footer">
          <button type="button" className="add-to-post-btn" onClick={handleOpenActionSheet}>
            <span>إضافة إلى منشورك</span>
            <div className="action-icons-preview">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
            </div>
          </button>
        </footer>

        {isActionSheetOpen && <PostActionSheet onClose={handleCloseActionSheet} onAddMedia={handleAddMediaClick} />}

        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*,video/*"
        />
      </form>
    </div>
  );
};

export default CreatePostScreen;