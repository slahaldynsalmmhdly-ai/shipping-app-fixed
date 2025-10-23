import React from 'react';
import './CommentSheet.css';
import type { ToastType, UiComment, ConfirmationModalConfig } from '../../App';
import CommentSection from './CommentSection'; // New Import

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: any | null;
  user: any | null;
  onShowToast: (message: string, type: ToastType) => void;
  onCommentChange: (updatedPost: any) => void;
  commentsCache: Map<string, UiComment[]>;
  setCommentsCache: React.Dispatch<React.SetStateAction<Map<string, UiComment[]>>>;
  onOpenReportProfile: (user: any) => void;
  onOpenConfirmationModal: (config: Omit<ConfirmationModalConfig, 'isOpen'>) => void;
}

const CommentSheet: React.FC<CommentSheetProps> = (props) => {
  const { isOpen, onClose, post } = props;
  
  // Do not render anything if there is no post, even if isOpen is true.
  if (!post) return null;

  return (
    <>
      <div className={`comment-sheet-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose}>
        <div 
          className={`comment-sheet-content ${isOpen ? 'open' : ''}`} 
          onClick={(e) => e.stopPropagation()}
        >
          <header className="comment-sheet-header">
            <div className="modal-handle-bar"></div>
            <h3>التعليقات</h3>
          </header>
          {/* Conditionally render CommentSection only when the sheet is open.
              This ensures it unmounts and cleans up its timers and async operations
              when the sheet is closed, preventing errors on logout. */}
          {isOpen && <CommentSection {...props} />}
        </div>
      </div>
    </>
  );
};

export default CommentSheet;