import React, { useState, useEffect, useRef } from 'react';
import './CommentSection.css';
import { API_BASE_URL } from '../../config';
import type { ToastType, UiComment, UiReply, ConfirmationModalConfig } from '../../App';
import CommentSkeleton from './CommentSkeleton';
import CommentContextMenu from './CommentContextMenu';

// Helper to get full URL for avatars
const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

// Helper for relative time
const getRelativeTime = (dateString: string) => {
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
    return 'الآن';
};

// --- API and UI Type Definitions ---
interface ApiReply {
  _id: string;
  user: { _id: string; name: string; avatar?: string } | null;
  text: string;
  createdAt: string;
  likes: any[];
}

interface ApiComment extends ApiReply {
  replies: ApiReply[];
}

// --- API Endpoint Helpers ---
const getPostType = (post: any) => {
    if (!post) return 'general';
    return post.type || (post.pickupLocation ? 'shipmentAd' : post.currentLocation ? 'emptyTruckAd' : 'general');
}

const getCommentEndpoint = (post: any): string | null => {
  if (!post || (!post.id && !post._id)) return null;
  const postId = post.id || post._id;
  const postType = getPostType(post);
  switch (postType) {
    case 'shipmentAd': return `${API_BASE_URL}/api/v1/shipmentads/${postId}/comment`;
    case 'emptyTruckAd': return `${API_BASE_URL}/api/v1/emptytruckads/${postId}/comment`;
    case 'general': return `${API_BASE_URL}/api/v1/posts/${postId}/comment`;
    default: return null;
  }
};

const getCommentReplyEndpoint = (post: any, commentId: string): string | null => {
    if (!post || (!post.id && !post._id)) return null;
    const postId = post.id || post._id;
    const postType = getPostType(post);
    switch (postType) {
        case 'shipmentAd': return `${API_BASE_URL}/api/v1/shipmentads/${postId}/comment/${commentId}/reply`;
        case 'emptyTruckAd': return `${API_BASE_URL}/api/v1/emptytruckads/${postId}/comment/${commentId}/reply`;
        case 'general': return `${API_BASE_URL}/api/v1/posts/${postId}/comment/${commentId}/reply`;
        default: return null;
    }
};

const getCommentLikeEndpoint = (post: any, commentId: string, replyId?: string): string | null => {
    if (!post || (!post.id && !post._id)) return null;
    const postId = post.id || post._id;
    const postType = getPostType(post);
    
    if (replyId) {
        switch (postType) {
            case 'shipmentAd': return `${API_BASE_URL}/api/v1/shipmentads/${postId}/comment/${commentId}/reply/${replyId}/like`;
            case 'emptyTruckAd': return `${API_BASE_URL}/api/v1/emptytruckads/${postId}/comment/${commentId}/reply/${replyId}/like`;
            case 'general': return `${API_BASE_URL}/api/v1/posts/${postId}/comment/${commentId}/reply/${replyId}/like`;
            default: return null;
        }
    }
    
    switch (postType) {
        case 'shipmentAd': return `${API_BASE_URL}/api/v1/shipmentads/${postId}/comment/${commentId}/like`;
        case 'emptyTruckAd': return `${API_BASE_URL}/api/v1/emptytruckads/${postId}/comment/${commentId}/like`;
        case 'general': return `${API_BASE_URL}/api/v1/posts/${postId}/comment/${commentId}/like`;
        default: return null;
    }
};

const getPostDetailsEndpoint = (post: any): string | null => {
    if (!post || (!post.id && !post._id)) return null;
    const postId = post.id || post._id;
    const postType = getPostType(post);
    switch (postType) {
        case 'shipmentAd': return `${API_BASE_URL}/api/v1/shipmentads/${postId}`;
        case 'emptyTruckAd': return `${API_BASE_URL}/api/v1/emptytruckads/${postId}`;
        case 'general': return `${API_BASE_URL}/api/v1/posts/${postId}`;
        default: return null;
    }
};

const getDeleteEndpoint = (post: any, commentId: string, replyId?: string): string | null => {
    if (!post || (!post.id && !post._id)) return null;
    const postId = post.id || post._id;
    const postType = getPostType(post);
    const postTypePlural = postType === 'general' ? 'posts' : (postType.endsWith('Ad') ? `${postType}s` : `${postType}s`);

    if (replyId) {
        return `${API_BASE_URL}/api/v1/${postTypePlural}/${postId}/comment/${commentId}/reply/${replyId}`;
    }
    return `${API_BASE_URL}/api/v1/${postTypePlural}/${postId}/comment/${commentId}`;
};


interface CommentSectionProps {
  post: any | null;
  user: any | null;
  onShowToast: (message: string, type: ToastType) => void;
  onCommentChange: (updatedPost: any) => void;
  commentsCache: Map<string, UiComment[]>;
  setCommentsCache: React.Dispatch<React.SetStateAction<Map<string, UiComment[]>>>;
  onOpenReportProfile: (user: any) => void;
  onOpenConfirmationModal: (config: Omit<ConfirmationModalConfig, 'isOpen'>) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ post, user, onShowToast, onCommentChange, commentsCache, setCommentsCache, onOpenReportProfile, onOpenConfirmationModal }) => {
  const [comments, setComments] = useState<UiComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<UiComment | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [contextMenuState, setContextMenuState] = useState<{ comment: UiComment | UiReply | null; isOwner: boolean }>({ comment: null, isOwner: false });
  const editorRef = useRef<HTMLDivElement>(null);
  const likeDebounceTimers = useRef<Map<string, number>>(new Map());
  // FIX: Explicitly initialize useRef with `undefined` to fix "Expected 1 arguments, but got 0" error.
  const longPressTimer = useRef<number | undefined>(undefined);
  const serverLikeState = useRef<Map<string, { isLiked: boolean; likes: number }>>(new Map());
  const pendingLikeToggles = useRef<Map<string, number>>(new Map());
  const isMounted = useRef(true);
  const [dislikedItems, setDislikedItems] = useState(new Set<string>());


  // Data Mapping Functions
  const mapApiReplyToUi = (apiReply: ApiReply, currentUser: { _id: string } | null): UiReply => ({
    id: apiReply._id,
    user: apiReply.user || { _id: 'deleted', name: 'مستخدم محذوف' },
    name: apiReply.user?.name || 'مستخدم محذوف',
    avatar: getFullImageUrl(apiReply.user?.avatar) || `https://ui-avatars.com/api/?name=${(apiReply.user?.name || '?').charAt(0)}&background=random&color=fff&size=40`,
    text: apiReply.text,
    time: getRelativeTime(apiReply.createdAt),
    likes: apiReply.likes?.length || 0,
    isLikedByCurrentUser: currentUser ? (apiReply.likes || []).some(like => (typeof like === 'string' ? like : like.user) === currentUser._id) : false,
  });

  const mapApiCommentToUi = (apiComment: ApiComment, currentUser: { _id: string } | null): UiComment => ({
    ...mapApiReplyToUi(apiComment, currentUser),
    replyCount: apiComment.replies?.length || 0,
    replies: (apiComment.replies || []).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(reply => mapApiReplyToUi(reply, currentUser)),
  });

  useEffect(() => {
    isMounted.current = true;
    // Cleanup function runs when component unmounts
    return () => {
        isMounted.current = false;
        // Clear all pending like timers
        likeDebounceTimers.current.forEach(timerId => {
            clearTimeout(timerId);
        });
        likeDebounceTimers.current.clear();
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount


  useEffect(() => {
    if (post) {
      const postId = post.id || post._id;
      const cachedComments = commentsCache.get(postId);

      const fetchComments = async () => {
        setIsLoading(true);
        try {
          const endpoint = getPostDetailsEndpoint(post);
          if (!endpoint) throw new Error("لا يمكن تحديد نوع المنشور.");
          const token = localStorage.getItem('authToken');
          const res = await fetch(endpoint, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
          if (!res.ok) throw new Error('فشل في تحميل التعليقات.');
          
          const postWithDetails = await res.json();
          const sortedApiComments = [...(postWithDetails.comments || [])].sort((a: ApiComment, b: ApiComment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const uiComments = sortedApiComments.map(c => mapApiCommentToUi(c, user));
          
          if (isMounted.current) {
            setComments(uiComments);
            // Using a functional update for setting the cache to prevent using stale state.
            setCommentsCache(prevCache => {
                const newCache = new Map(prevCache);
                newCache.set(postId, uiComments);
                return newCache;
            });
          }
        } catch (error: any) {
          console.error(error);
          if (isMounted.current) {
            onShowToast(error.message || 'فشل في تحميل التعليقات.', 'error');
            setComments([]);
          }
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      };

      if (cachedComments) {
        setComments(cachedComments);
        setIsLoading(false);
      } else {
        fetchComments();
      }
    }
  }, [post, commentsCache, setCommentsCache, onShowToast, user]);
  
    const handleDislike = (itemId: string, parentId?: string) => {
        if (!user) { onShowToast('يجب تسجيل الدخول أولاً.', 'error'); return; }
        
        const uniqueId = parentId ? `${parentId}-${itemId}` : itemId;
        const wasDisliked = dislikedItems.has(uniqueId);

        // Optimistically toggle dislike
        setDislikedItems(prev => {
            const newSet = new Set(prev);
            if (wasDisliked) {
                newSet.delete(uniqueId);
            } else {
                newSet.add(uniqueId);
            }
            return newSet;
        });

        // If it was liked, and we are now disliking it, we must unlike it
        let wasLiked = false;
        for (const c of comments) {
            if (parentId && c.id === parentId) {
                const reply = c.replies.find(r => r.id === itemId);
                if (reply) { wasLiked = reply.isLikedByCurrentUser; break; }
            } else if (!parentId && c.id === itemId) {
                wasLiked = c.isLikedByCurrentUser;
                break;
            }
        }
        
        if (!wasDisliked && wasLiked) {
            handleLike(itemId, parentId, true); // Pass a flag to indicate it's a forced unlike from dislike action
        }
    };
    
    const handleLike = (itemId: string, parentId?: string, forceUnlike = false) => {
    if (!post || !user) {
        onShowToast('يجب تسجيل الدخول أولاً.', 'error');
        return;
    }

    const uniqueId = parentId ? `${parentId}-${itemId}` : itemId;

    if (!serverLikeState.current.has(uniqueId)) {
        let originalItem: { isLiked: boolean; likes: number } | null = null;
        for (const c of comments) {
            if (parentId && c.id === parentId) {
                const reply = c.replies.find(r => r.id === itemId);
                if (reply) { originalItem = { isLiked: reply.isLikedByCurrentUser, likes: reply.likes }; break; }
            } else if (!parentId && c.id === itemId) {
                originalItem = { isLiked: c.isLikedByCurrentUser, likes: c.likes }; break;
            }
        }
        if (!originalItem) return;
        serverLikeState.current.set(uniqueId, originalItem);
    }

    // New logic: if we are liking, we must un-dislike
    if (!forceUnlike) {
        setDislikedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(uniqueId)) {
                newSet.delete(uniqueId);
            }
            return newSet;
        });
    }


    setComments(prevComments => prevComments.map(c => {
        if (parentId && c.id === parentId) {
            return {
                ...c,
                replies: c.replies.map(r => r.id === itemId ? {
                    ...r,
                    isLikedByCurrentUser: forceUnlike ? false : !r.isLikedByCurrentUser,
                    likes: forceUnlike ? (r.isLikedByCurrentUser ? r.likes - 1 : r.likes) : (r.isLikedByCurrentUser ? r.likes - 1 : r.likes + 1)
                } : r)
            };
        } else if (!parentId && c.id === itemId) {
            return {
                ...c,
                isLikedByCurrentUser: forceUnlike ? false : !c.isLikedByCurrentUser,
                likes: forceUnlike ? (c.isLikedByCurrentUser ? c.likes - 1 : c.likes) : (c.isLikedByCurrentUser ? c.likes - 1 : c.likes + 1)
            };
        }
        return c;
    }));

    clearTimeout(likeDebounceTimers.current.get(uniqueId));
    const timerId = window.setTimeout(async () => {
        if (!isMounted.current) return;
        const token = localStorage.getItem('authToken');
        const original = serverLikeState.current.get(uniqueId);
        if (!token || !original) {
            // Revert logic here if needed
            return;
        }

        try {
            const endpoint = getCommentLikeEndpoint(post, parentId || itemId, parentId ? itemId : undefined);
            if (!endpoint) throw new Error("Invalid post type for liking.");
            const response = await fetch(endpoint, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("فشل التفاعل مع التعليق.");
            serverLikeState.current.delete(uniqueId);
        } catch (error: any) {
             if (isMounted.current) onShowToast(error.message || 'حدث خطأ ما', 'error');
        } finally {
            likeDebounceTimers.current.delete(uniqueId);
        }
    }, 500); // 500ms debounce window

    likeDebounceTimers.current.set(uniqueId, timerId);
};
  
    const handleAddComment = async () => {
        // 1. Guard clauses
        if (!commentText.trim() || !post || !user) {
            if (!user) onShowToast('يجب تسجيل الدخول أولاً.', 'error');
            return;
        }
        if (isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);
        const isReply = !!replyingTo;
        const tempId = `temp_${Date.now()}`;
        const textToSend = commentText; // Capture the text before clearing
        const replyingToTarget = replyingTo; // Capture reply target

        // 2. Optimistic UI Update
        const tempItem: any = {
            id: tempId,
            user: { _id: user._id, name: user.name, avatar: user.avatar },
            name: user.name,
            avatar: getFullImageUrl(user.avatar) || `https://ui-avatars.com/api/?name=${(user.name || '?').charAt(0)}&background=random&color=fff&size=40`,
            text: textToSend,
            time: 'الآن',
            likes: 0,
            isLikedByCurrentUser: false,
            isSending: true,
        };

        if (isReply && replyingToTarget) {
            setComments(prev => prev.map(c =>
                c.id === replyingToTarget.id
                    ? { ...c, replyCount: c.replyCount + 1, replies: [...c.replies, tempItem] }
                    : c
            ));
            setExpandedComments(prev => new Set(prev).add(replyingToTarget.id));
        } else {
            setComments(prev => [{ ...tempItem, replyCount: 0, replies: [] }, ...prev]);
        }

        // 3. Clear Input Immediately
        setCommentText('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        setReplyingTo(null);

        // 4. API Call
        const endpoint = isReply && replyingToTarget ? getCommentReplyEndpoint(post, replyingToTarget.id) : getCommentEndpoint(post);
        if (!endpoint) {
            onShowToast("لا يمكن تحديد نوع المنشور.", "error");
            setIsSubmitting(false);
            if (isMounted.current) {
                if (isReply && replyingToTarget) {
                    setComments(prev => prev.map(c => c.id === replyingToTarget.id ? { ...c, replyCount: c.replyCount - 1, replies: c.replies.filter(r => r.id !== tempId) } : c));
                } else {
                    setComments(prev => prev.filter(c => c.id !== tempId));
                }
            }
            return;
        }
        
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text: textToSend })
            });
            const updatedPost = await res.json();
            if (!res.ok) throw new Error(updatedPost.message || "فشل إرسال التعليق.");

            if (isMounted.current) {
                const sortedApiComments = [...updatedPost.comments].sort((a: ApiComment, b: ApiComment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                const newUiComments = sortedApiComments.map(c => mapApiCommentToUi(c, user));
                setComments(newUiComments);
                setCommentsCache(prev => new Map(prev).set(post.id || post._id, newUiComments));
                onCommentChange(updatedPost);
            }
        } catch (e: any) {
            if (isMounted.current) {
                onShowToast(e.message, 'error');
                if (isReply && replyingToTarget) {
                    setComments(prev => prev.map(c =>
                        c.id === replyingToTarget.id
                            ? { ...c, replyCount: c.replyCount - 1, replies: c.replies.filter(r => r.id !== tempId) }
                            : c
                    ));
                } else {
                    setComments(prev => prev.filter(c => c.id !== tempId));
                }
                setReplyingTo(replyingToTarget);
                setCommentText(textToSend);
                if (editorRef.current) {
                    editorRef.current.innerHTML = '';
                    if (replyingToTarget) {
                        const mentionHtml = `<span class="mention" contenteditable="false">@${replyingToTarget.name}&nbsp;</span>`;
                        const remainingText = textToSend.replace(`@${replyingToTarget.name} `, '');
                        editorRef.current.innerHTML = mentionHtml + remainingText;
                    } else {
                        editorRef.current.innerText = textToSend;
                    }
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(editorRef.current);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }
        } finally {
            if (isMounted.current) {
                setIsSubmitting(false);
            }
        }
    };

    const handleDelete = (itemToDelete: UiComment | UiReply) => {
        closeContextMenu();
        const isReply = !("replyCount" in itemToDelete);
        
        onOpenConfirmationModal({
            title: `حذف ال${isReply ? "رد" : "تعليق"}`,
            message: `هل أنت متأكد من رغبتك في حذف هذا ال${isReply ? "رد" : "تعليق"}؟ لا يمكن التراجع عن هذا الإجراء.`,
            
            onConfirm: () => {
                const originalComments = [...comments];
                let parentCommentId: string | undefined;
                if (isReply) { parentCommentId = comments.find(c => c.replies.some(r => r.id === itemToDelete.id))?.id; }
                const newComments = comments.map(c => {
                    if (isReply && parentCommentId && c.id === parentCommentId) {
                        return { ...c, replies: c.replies.filter(r => r.id !== itemToDelete.id), replyCount: c.replyCount > 0 ? c.replyCount - 1 : 0 };
                    }
                    return c;
                }).filter(c => !isReply ? c.id !== itemToDelete.id : true);
                setComments(newComments);
                const postId = post.id || post._id;
                setCommentsCache(prev => new Map(prev).set(postId, newComments));

                (async () => {
                    try {
                        const token = localStorage.getItem("authToken");
                        if (!token) throw new Error("المستخدم غير مصادق عليه.");
                        const endpoint = getDeleteEndpoint(post, isReply ? parentCommentId! : itemToDelete.id, isReply ? itemToDelete.id : undefined);
                        if (!endpoint) throw new Error("لا يمكن تحديد نقطة النهاية للحذف.");
                        const res = await fetch(endpoint, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
                        if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.message || "فشل الحذف من الخادم."); }
                        if (isMounted.current) onShowToast("تم الحذف بنجاح", "success");
                    } catch (err: any) {
                        if (isMounted.current) {
                            onShowToast(err.message || "فشل في حذف التعليق.", "error");
                            setComments(originalComments);
                            setCommentsCache(prev => new Map(prev).set(postId, originalComments));
                        }
                    }
                })();
            },
        });
    };
    
    // Wrapper functions to stop propagation
    const handleLikeClick = (e: React.MouseEvent, itemId: string, parentId?: string) => {
        e.stopPropagation();
        handleLike(itemId, parentId);
    };
    const handleDislikeClick = (e: React.MouseEvent, itemId: string, parentId?: string) => {
        e.stopPropagation();
        handleDislike(itemId, parentId);
    };
    const handleReplyClick = (e: React.MouseEvent, comment: UiComment | UiReply) => {
        e.stopPropagation();
        handleStartReply(comment);
    };

    const closeContextMenu = () => setContextMenuState({ comment: null, isOwner: false });
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const editor = e.currentTarget;
        const text = editor.innerText;
        const hasMention = editor.querySelector('span.mention') !== null;
        
        if (replyingTo && !hasMention) {
            setReplyingTo(null);
        }
        setCommentText(text);
    };
    const handleStartReply = (commentOrReply: UiComment | UiReply) => {
        let parentComment: UiComment;
        const isTopLevelComment = 'replyCount' in commentOrReply;

        if (isTopLevelComment) {
            parentComment = commentOrReply;
        } else {
            const foundParent = comments.find(c => c.replies.some(r => r.id === commentOrReply.id));
            if (!foundParent) {
                onShowToast('لا يمكن الرد على هذا التعليق.', 'error');
                return;
            }
            parentComment = foundParent;
        }

        setReplyingTo(parentComment);

        if (editorRef.current) {
            const mentionHtml = `<span class="mention" contenteditable="false">@${commentOrReply.name}&nbsp;</span>`;
            editorRef.current.innerHTML = mentionHtml;
            setCommentText(`@${commentOrReply.name} `);
            
            editorRef.current.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    };
    const toggleReplies = (commentId: string) => setExpandedComments(prev => { const newSet = new Set(prev); if (newSet.has(commentId)) { newSet.delete(commentId); } else { newSet.add(commentId); } return newSet; });
    const commentItemEvents = (comment: UiComment | UiReply) => ({ onTouchStart: (e: React.TouchEvent) => handlePressStart(e, comment), onTouchEnd: handlePressEnd, onMouseDown: (e: React.MouseEvent) => handlePressStart(e, comment), onMouseUp: handlePressEnd, onMouseLeave: handlePressEnd, onContextMenu: (e: React.MouseEvent) => e.preventDefault(), });
    const handlePressStart = (e: React.TouchEvent | React.MouseEvent, comment: UiComment | UiReply) => { clearTimeout(longPressTimer.current); longPressTimer.current = window.setTimeout(() => setContextMenuState({ comment, isOwner: user?._id === comment.user._id }), 500); };
    const handlePressEnd = () => clearTimeout(longPressTimer.current);
    const handleCopy = (text: string) => { navigator.clipboard.writeText(text); onShowToast('تم نسخ النص', 'success'); };
    const handleReport = (commentToReport: UiComment | UiReply) => onOpenReportProfile(commentToReport.user);
    

    return (
        <>
            <div className="comment-section-wrapper">
                <main className="comment-section-body">
                    {isLoading ? <CommentSkeleton /> : comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className={`comment-item-wrapper ${comment.isSending ? 'is-sending' : ''} ${comment.replyCount > 0 ? 'has-replies' : ''}`}>
                                <div className="comment-item" {...commentItemEvents(comment)}>
                                    <img src={comment.avatar} alt={comment.name} className="comment-avatar" />
                                    <div className="comment-main-content">
                                        <div className="comment-bubble"><h4>{comment.name}</h4><p>{comment.text}</p></div>
                                        <div className="comment-actions">
                                            <span>{comment.time}</span>
                                            <div className="comment-engagement-actions">
                                                <button className={`like-btn ${comment.isLikedByCurrentUser ? 'liked' : ''}`} onClick={(e) => handleLikeClick(e, comment.id)} disabled={comment.isSending}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                                    <span className="like-count">{comment.likes > 0 ? comment.likes : ''}</span>
                                                </button>
                                                <button className={`dislike-btn ${dislikedItems.has(comment.id) ? 'disliked' : ''}`} onClick={(e) => handleDislikeClick(e, comment.id)} disabled={comment.isSending}>
                                                    {dislikedItems.has(comment.id) ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57L8.34,20.67C8.34,20.93 8.45,21.17 8.62,21.34L9.67,22.39L16.27,15.79C16.63,15.42 16.84,14.93 16.84,14.4V5A2,2 0 0,0 15,3Z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57L8.34,20.67C8.34,20.93 8.45,21.17 8.62,21.34L9.67,22.39L16.27,15.79C16.63,15.42 16.84,14.93 16.84,14.4V5A2,2 0 0,0 15,3M15,5V14.4L9.83,19.57L10.78,15H3V12.27L6.16,5H15Z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button className="reply-btn" onClick={(e) => handleReplyClick(e, comment)} disabled={comment.isSending}>رد</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {comment.replyCount > 0 && (
                                    <div className="replies-section">
                                        <button onClick={() => toggleReplies(comment.id)} className="view-replies-btn">{expandedComments.has(comment.id) ? 'إخفاء الردود' : `عرض الردود (${comment.replyCount})`}</button>
                                        {expandedComments.has(comment.id) && (
                                            <div className="replies-list">
                                                {comment.replies.map(reply => (
                                                    <div key={reply.id} className={`reply-item ${reply.isSending ? 'is-sending' : ''}`} {...commentItemEvents(reply)}>
                                                        <img src={reply.avatar} alt={reply.name} className="reply-avatar" />
                                                        <div className="comment-main-content">
                                                            <div className="comment-bubble"><h4>{reply.name}</h4><p>{reply.text}</p></div>
                                                            <div className="comment-actions">
                                                                <span>{reply.time}</span>
                                                                <div className="comment-engagement-actions">
                                                                     <button className={`like-btn ${reply.isLikedByCurrentUser ? 'liked' : ''}`} onClick={(e) => handleLikeClick(e, reply.id, comment.id)} disabled={reply.isSending}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                                                        <span className="like-count">{reply.likes > 0 ? reply.likes : ''}</span>
                                                                    </button>
                                                                    <button className={`dislike-btn ${dislikedItems.has(`${comment.id}-${reply.id}`) ? 'disliked' : ''}`} onClick={(e) => handleDislikeClick(e, reply.id, comment.id)} disabled={reply.isSending}>
                                                                        {dislikedItems.has(`${comment.id}-${reply.id}`) ? (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                                                <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57L8.34,20.67C8.34,20.93 8.45,21.17 8.62,21.34L9.67,22.39L16.27,15.79C16.63,15.42 16.84,14.93 16.84,14.4V5A2,2 0 0,0 15,3Z" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                                                <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57L8.34,20.67C8.34,20.93 8.45,21.17 8.62,21.34L9.67,22.39L16.27,15.79C16.63,15.42 16.84,14.93 16.84,14.4V5A2,2 0 0,0 15,3M15,5V14.4L9.83,19.57L10.78,15H3V12.27L6.16,5H15Z" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                    <button className="reply-btn" onClick={(e) => handleReplyClick(e, reply)} disabled={reply.isSending}>رد</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-comments-placeholder"><p>لا توجد تعليقات بعد. كن أول من يعلّق!</p></div>
                    )}
                </main>
                <footer className="comment-input-footer">
                    <div className="comment-input-area">
                        <div ref={editorRef} className="comment-input-div" contentEditable={!isSubmitting} onInput={handleInput} aria-placeholder="إضافة تعليق..." />
                    </div>
                    <button className="comment-send-btn" aria-label="إرسال" onClick={handleAddComment} disabled={!commentText.trim() || isSubmitting}>
                        <svg className="send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                    </button>
                </footer>
            </div>
            {contextMenuState.comment && (
                <CommentContextMenu
                    comment={contextMenuState.comment}
                    isOwner={contextMenuState.isOwner}
                    onClose={closeContextMenu}
                    onReply={handleStartReply}
                    onCopy={handleCopy}
                    onReport={handleReport}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
};

export default CommentSection;