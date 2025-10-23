import React, { useState } from 'react';

interface PostActionsProps {
    isOwner: boolean;
    onReport: () => void;
    onDelete?: () => void;
    onDismiss?: () => void;
    onEdit?: () => void; // New prop for editing
    reportText: string;
    deleteText: string;
}

const PostActions: React.FC<PostActionsProps> = ({ isOwner, onReport, onDelete, onDismiss, onEdit, reportText, deleteText }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const handleAction = (action?: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        action?.();
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaved(prev => !prev);
        // In a real app, you'd call an API here.
        // We'll close the menu for a better UX.
        setIsMenuOpen(false);
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.href).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => {
                setIsLinkCopied(false);
                setIsMenuOpen(false);
            }, 1500); // Reset after 1.5 seconds
        });
    };


    return (
        <div className="post-header-actions">
            <div className="post-menu-wrapper">
                <button className="post-icon-btn" aria-label="المزيد" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                </button>
                {isMenuOpen && (
                    <>
                        <div className="post-menu-backdrop" onClick={handleAction()}></div>
                        <div className="post-menu-popover">
                            <ul>
                                {isOwner ? (
                                    <>
                                        <li onClick={handleSave}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                            </svg>
                                            <span>{isSaved ? 'إلغاء حفظ المنشور' : 'حفظ المنشور'}</span>
                                        </li>
                                        {onEdit && (
                                            <li onClick={handleAction(onEdit)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                </svg>
                                                <span>تعديل المنشور</span>
                                            </li>
                                        )}
                                        <li onClick={handleCopyLink}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                            </svg>
                                            <span>{isLinkCopied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                                        </li>
                                        <hr className="menu-separator" />
                                        {onDelete && (
                                            <li className="danger" onClick={handleAction(onDelete)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                <span>{deleteText}</span>
                                            </li>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <li onClick={handleSave}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                            </svg>
                                            <span>{isSaved ? 'إلغاء حفظ المنشور' : 'حفظ المنشور'}</span>
                                        </li>
                                         <li onClick={handleAction(() => console.log('Turn on notifications'))}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                            </svg>
                                            <span>تفعيل إشعارات المنشور</span>
                                        </li>
                                        <li onClick={handleCopyLink}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                            </svg>
                                            <span>{isLinkCopied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                                        </li>
                                        <li onClick={handleAction(onDismiss)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                            <span>عدم إظهار هذا المنشور</span>
                                        </li>
                                        <hr className="menu-separator" />
                                         <li className="danger" onClick={handleAction(onReport)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
                                            <span>{reportText}</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </>
                )}
            </div>
            {onDismiss && !isOwner && (
                <button className="post-icon-btn" aria-label="إخفاء" onClick={handleAction(onDismiss)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default PostActions;