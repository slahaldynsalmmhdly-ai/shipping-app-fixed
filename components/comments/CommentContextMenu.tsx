import React from 'react';
import './CommentContextMenu.css';
import { UiComment, UiReply } from '../../App';

interface CommentContextMenuProps {
  comment: UiComment | UiReply | null;
  onClose: () => void;
  onReply: (comment: UiComment | UiReply) => void;
  onCopy: (text: string) => void;
  onReport: (comment: UiComment | UiReply) => void;
  onDelete: (comment: UiComment | UiReply) => void;
  isOwner: boolean;
}

const CommentContextMenu: React.FC<CommentContextMenuProps> = ({
  comment,
  onClose,
  onReply,
  onCopy,
  onReport,
  onDelete,
  isOwner,
}) => {
  if (!comment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content context-menu-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle-bar"></div>
        <div className="context-menu-comment-preview">
          <p>{comment.text}</p>
        </div>
        <ul className="context-menu-options">
          <li onClick={() => { onReply(comment); onClose(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
            <span>رد</span>
          </li>
          <li onClick={() => { onCopy(comment.text); onClose(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
            <span>نسخ النص</span>
          </li>
          {!isOwner && (
            <li onClick={() => { onReport(comment); onClose(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
              <span>الإبلاغ</span>
            </li>
          )}
          {isOwner && (
            <li className="danger" onClick={() => { onDelete(comment); onClose(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              <span>حذف</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommentContextMenu;
