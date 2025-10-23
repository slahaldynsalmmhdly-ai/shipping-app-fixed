import React, { useRef, useState, useEffect, useMemo } from 'react';
import ShipmentPost from './ShipmentPost';
import GeneralPost from './GeneralPost';
import RepostedPost from './RepostedPost'; // New Import
import EmptyTruckAdPost from './EmptyTruckAdPost';
import StoryCard from './StoryCard';
import './HomeScreen.css';
import { API_BASE_URL } from '../../config';
import StoryCardSkeleton from './StoryCardSkeleton';
import type { Company, PublishingType, ToastType, Screen } from '../../App';
import ShipmentPostSkeleton from './ShipmentPostSkeleton';
import GeneralPostSkeleton from './GeneralPostSkeleton';
import PublishingIndicator from './PublishingIndicator';
import NewlyCreatedAdCard from './NewlyCreatedAdCard';

// --- START: New components defined locally ---
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const starPath = "m5.825 21 2.325-7.6-5.6-5.45 7.625-1.125L12 0l2.825 6.825 7.625 1.125-5.6 5.45L19.175 21 12 17.275Z";
    const emptyStarColor = "var(--border-color)";

    return (
        <div className="star-rating">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} viewBox="0 0 24 24" fill="currentColor"><path d={starPath} /></svg>
            ))}
            {halfStar && (
                <svg key="half" viewBox="0 0 24 24">
                    <defs>
                        <clipPath id="half-star-clip-rtl-home">
                            <rect x="12" y="0" width="12" height="24" />
                        </clipPath>
                    </defs>
                    <path d={starPath} fill={emptyStarColor} />
                    <path d={starPath} fill="currentColor" clipPath="url(#half-star-clip-rtl-home)" />
                </svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} viewBox="0 0 24 24" fill={emptyStarColor}><path d={starPath} /></svg>
            ))}
        </div>
    );
};


const CompanySuggestionCardSkeleton: React.FC = () => (
    <div className="company-suggestion-card-skeleton">
        <div className="skeleton-card-bg"></div>
        <div className="skeleton skeleton-card-avatar"></div>
        <div className="skeleton skeleton-card-rating"></div>
        <div className="skeleton skeleton-card-line" style={{ width: '70%' }}></div>
        <div className="skeleton skeleton-card-line" style={{ width: '40%', height: '10px' }}></div>
        <div className="skeleton skeleton-card-btn"></div>
    </div>
);

const CompanySuggestionCard: React.FC<{ company: Company & { avatarUrl: string; coverImageUrl: string | null }; onOpenProfile: (company: any) => void; onOpenChat: (user: any) => void; }> = ({ company, onOpenProfile, onOpenChat }) => {
    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onOpenProfile from firing
        onOpenChat(company);
    };
    
    return (
        <div className="company-suggestion-card" onClick={() => onOpenProfile(company)}>
            <div className="card-background">
                {company.coverImageUrl ? (
                    <img src={company.coverImageUrl} alt="" className="card-background-image" />
                ) : (
                    <div className="card-background-color"></div>
                )}
            </div>
            <img src={company.avatarUrl} alt={company.name} className="card-avatar" />
            <div className="card-rating-summary">
                <StarRating rating={company.rating || 0} />
                {company.rating && company.rating > 0 && (
                    <span className="card-rating-number">{company.rating.toFixed(1)}</span>
                )}
            </div>
            <h4 className="card-name">{company.name}</h4>
            <p className="card-category">خدمات شحن</p>
            <button className="card-chat-btn" onClick={handleChatClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>الدردشة</span>
            </button>
        </div>
    );
};

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }
  if (url.startsWith('data:image') || url.startsWith('http')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const SuggestedCompaniesSection: React.FC<{ companies: Company[]; isLoading: boolean; error: string | null; onOpenOtherProfile: (user: any) => void; onOpenChat: (user: any) => void; }> = ({ companies, isLoading, error, onOpenOtherProfile, onOpenChat }) => {
    
    if (!isLoading && (error || !companies || companies.length === 0)) {
        return null;
    }

    return (
        <section className="suggested-companies-section">
            <h2>شركات قد تعجبك</h2>
            <div className="suggested-companies-container">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <CompanySuggestionCardSkeleton key={i} />)
                ) : (
                    <>
                        {companies.map(company => {
                            // Robustly get avatar and cover image paths, checking for multiple possible property names.
                            const avatarPath = company.avatar || (company as any).avatarUrl;
                            const coverPath = company.coverImage || (company as any).cover;

                            const companyWithUrls = {
                                ...company,
                                avatarUrl: avatarPath
                                    ? getFullImageUrl(avatarPath)
                                    : `https://ui-avatars.com/api/?name=${company.name.charAt(0)}&background=random&color=fff&size=60`,
                                coverImageUrl: coverPath ? getFullImageUrl(coverPath) : null
                            };

                            return (
                                <CompanySuggestionCard 
                                    key={company._id} 
                                    company={companyWithUrls} 
                                    onOpenProfile={onOpenOtherProfile}
                                    onOpenChat={onOpenChat}
                                />
                            );
                        })}
                    </>
                )}
            </div>
        </section>
    );
};

// --- END: New components ---



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

// Helper functions to manage dismissed posts in localStorage
const getDismissedPostIds = (): string[] => {
    const dismissed = localStorage.getItem('dismissedPostIds');
    return dismissed ? JSON.parse(dismissed) : [];
};

const addDismissedPostId = (postId: string) => {
    const currentIds = getDismissedPostIds();
    if (!currentIds.includes(postId)) {
        const newIds = [...currentIds, postId];
        localStorage.setItem('dismissedPostIds', JSON.stringify(newIds));
    }
};

const HomeScreen: React.FC<{ 
  className?: string; 
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenExplore: () => void;
  onOpenCreateAdModal: () => void; 
  onOpenReportPost: (post: any) => void;
  onOpenMyProfile: () => void;
  onOpenOtherProfile: (user: any) => void;
  onOpenChat: (user: any) => void;
  onOpenChatList: () => void;
  onOpenCommentSheet: (post: any) => void;
  onOpenRepostModal: (post: any) => void;
  onOpenEditPost: (post: any, origin: Screen) => void;
  companiesCache: Company[] | null;
  setCompaniesCache: (companies: Company[]) => void;
  user: any;
  postsVersion: number;
  publishingType: PublishingType;
  onPublishingComplete: () => void;
  onOpenConfirmationModal: (config: { title: string, message: string, onConfirm: () => void }) => void;
  deletedItemIds: Set<string>;
  addDeletedItemId: (itemId: string) => void;
  onShowToast: (message: string, type: ToastType) => void;
  onScrollActivity?: () => void;
  unreadCount?: number;
}> = ({ className, onOpenNotifications, onOpenSearch, onOpenExplore, onOpenCreateAdModal, onOpenReportPost, onOpenMyProfile, onOpenOtherProfile, onOpenChat, onOpenChatList, onOpenCommentSheet, onOpenRepostModal, onOpenEditPost, companiesCache, setCompaniesCache, user, postsVersion, publishingType, onPublishingComplete, onOpenConfirmationModal, deletedItemIds, addDeletedItemId, onShowToast, onScrollActivity, unreadCount = 0 }) => {
  const feedRef = useRef<HTMLElement>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  
  const [publishingStatus, setPublishingStatus] = useState<'idle' | 'publishing' | 'success'>('idle');

  const isActive = className?.includes('page-active');

  useEffect(() => {
    const scrollableElement = feedRef.current;
    if (scrollableElement && onScrollActivity) {
        scrollableElement.addEventListener('scroll', onScrollActivity, { passive: true });
        return () => {
            scrollableElement.removeEventListener('scroll', onScrollActivity);
        };
    }
  }, [onScrollActivity]);

  const handleUpdateReactions = (postId: string, newReactions: any[]) => {
    setPosts(prevPosts =>
        prevPosts.map(p => (p.id === postId ? { ...p, reactions: newReactions } : p))
    );
  };

  useEffect(() => {
    // Filter posts whenever the deleted IDs set changes from another screen
    if (deletedItemIds.size > 0) {
        setPosts(prevPosts => prevPosts.filter(p => !deletedItemIds.has(p.id)));
    }
  }, [deletedItemIds]);

  useEffect(() => {
    if (publishingType !== 'idle' && publishingStatus === 'idle') {
      setPublishingStatus('publishing');
    }
  }, [publishingType, publishingStatus]);

  useEffect(() => {
    // Find if there's a new post that needs its animation flag removed
    const newPostIndex = posts.findIndex(p => p.isNew);
    if (newPostIndex > -1) {
        // After the animation, remove the flag to prevent re-animating on subsequent renders
        const timer = setTimeout(() => {
            setPosts(currentPosts => {
                const newPosts = [...currentPosts];
                const postToUpdate = { ...newPosts[newPostIndex] };
                delete postToUpdate.isNew;
                newPosts[newPostIndex] = postToUpdate;
                return newPosts;
            });
        }, 600); // Animation duration is 500ms, give it a little extra time

        return () => clearTimeout(timer);
    }
  }, [posts]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      setCompaniesError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setCompaniesError('المستخدم غير مسجل دخوله.');
        setIsLoadingCompanies(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/profile/companies`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: 'فشل في جلب قائمة الشركات.' }));
          throw new Error(errorData.message || 'فشل في جلب قائمة الشركات. يرجى التأكد من اتصالك بالإنترنت.');
        }

        const data: Company[] = await response.json();
        setCompanies(data || []);
        setCompaniesCache(data || []);
      } catch (err: any) {
        setCompaniesError(err.message);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    if (isActive) {
        if (companiesCache) {
            setCompanies(companiesCache);
            setIsLoadingCompanies(false);
            setCompaniesError(null);
        } else {
            fetchCompanies();
        }
    }
  }, [isActive, companiesCache, setCompaniesCache]);

  useEffect(() => {
    const fetchFeed = async () => {
        if (posts.length === 0) { // Only show full-page loader on initial load
            setIsLoadingPosts(true);
        }
        setPostsError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setPosts([]);
                if (publishingStatus === 'publishing') {
                    setPublishingStatus('idle');
                    onPublishingComplete();
                }
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };

            const [postsRes, shipmentAdsRes, emptyTruckAdsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/v1/posts`, { headers }),
                fetch(`${API_BASE_URL}/api/v1/shipmentads`, { headers }),
                fetch(`${API_BASE_URL}/api/v1/emptytruckads`, { headers }),
            ]);

            if (!postsRes.ok) throw new Error('فشل في جلب المنشورات.');
            if (!shipmentAdsRes.ok) throw new Error('فشل في جلب إعلانات الشحن.');
            if (!emptyTruckAdsRes.ok) throw new Error('فشل في جلب إعلانات الشاحنات الفارغة.');

            const generalPostsData = await postsRes.json();
            const shipmentAdsData = await shipmentAdsRes.json();
            const emptyTruckAdsData = await emptyTruckAdsRes.json();

            const generalPosts = (generalPostsData || []).map((p: any) => ({ ...p, id: p._id, type: 'general' }));
            const shipmentAds = (shipmentAdsData || []).map((ad: any) => ({ ...ad, id: ad._id, type: 'shipmentAd' }));
            const emptyTruckAds = (emptyTruckAdsData || []).map((ad: any) => ({ ...ad, id: ad._id, type: 'emptyTruckAd' }));

            const mergedFeed = [...generalPosts, ...shipmentAds, ...emptyTruckAds];
            mergedFeed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const dismissedIds = getDismissedPostIds();
            const filteredFeed = mergedFeed.filter(post => !dismissedIds.includes(post.id) && !deletedItemIds.has(post.id));

            // Mark the new post for animation if we were publishing
            if (publishingStatus === 'publishing') {
              const oldPostIds = new Set(posts.map(p => p.id));
              const newPost = filteredFeed.find(p => !oldPostIds.has(p.id));
              if (newPost) {
                newPost.isNew = true;
              }
            }

            setPosts(filteredFeed);
            
            if (publishingStatus === 'publishing') {
              setPublishingStatus('success');
            }

        } catch (err: any) {
            setPostsError(err.message);
            if (publishingStatus === 'publishing') {
                setPublishingStatus('idle');
                onPublishingComplete();
            }
        } finally {
            setIsLoadingPosts(false);
        }
    };
    
    if(isActive) {
        fetchFeed();
    }
  }, [isActive, postsVersion, user]);
  
  const createDeleteHandler = (itemType: string, itemId: string) => {
    onOpenConfirmationModal({
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: async () => {
        const originalPosts = [...posts];
        // Optimistic update: remove post from UI immediately
        setPosts(prevPosts => prevPosts.filter(p => p.id !== itemId));
        addDeletedItemId(itemId);

        let endpoint = '';
        if (itemType === 'post') {
            endpoint = `${API_BASE_URL}/api/v1/posts/${itemId}`;
        } else if (itemType === 'shipmentAd') {
            endpoint = `${API_BASE_URL}/api/v1/shipmentads/${itemId}`;
        } else if (itemType === 'emptyTruckAd') {
            endpoint = `${API_BASE_URL}/api/v1/emptytruckads/${itemId}`;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('يجب تسجيل الدخول للحذف.');

            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'فشل في حذف العنصر.');
            }
            
            onShowToast('تم الحذف بنجاح', 'success');

        } catch (err: any) {
            onShowToast(err.message, 'error');
            // Revert UI if the API call fails
            setPosts(originalPosts);
        }
      },
    });
  };

  const handleDismissPost = (postIdToDismiss: string) => {
      addDismissedPostId(postIdToDismiss);
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postIdToDismiss));
  };


    const renderPostItem = (item: any) => {
        if (!user) return null;
        const token = localStorage.getItem('authToken');
        const isOwner = user && item.user && user._id === item.user._id;

        if (item.type === 'general') {
            const mappedPost = {
                ...item,
                companyName: item.user.name,
                avatar: getFullImageUrl(item.user.avatar) || `https://ui-avatars.com/api/?name=${(item.user.name || '?').charAt(0)}&background=random&color=fff&size=50`,
                timeAgo: timeAgo(item.createdAt),
            };

            if (item.isRepost && item.originalPost) {
                return (
                    <RepostedPost 
                        key={item.id}
                        post={mappedPost}
                        isOwner={isOwner} 
                        onDeletePost={() => createDeleteHandler('post', item.id)}
                        onOpenReportPost={() => onOpenReportPost(mappedPost)}
                        onOpenChat={() => onOpenChat({ name: mappedPost.user.name, avatarUrl: getFullImageUrl(mappedPost.user.avatar) })}
                        onOpenProfile={isOwner ? onOpenMyProfile : () => onOpenOtherProfile(item.user)}
                        onOpenCommentSheet={() => onOpenCommentSheet(mappedPost)}
                        user={user}
                        token={token}
                        onShowToast={onShowToast}
                        onUpdateReactions={(reactions) => handleUpdateReactions(item.id, reactions)}
                    />
                );
            }

            return (
                <GeneralPost 
                    key={item.id}
                    post={mappedPost} 
                    isOwner={isOwner} 
                    onDeletePost={() => createDeleteHandler('post', item.id)}
                    onDismiss={() => handleDismissPost(item.id)}
                    onEditPost={() => onOpenEditPost(mappedPost, 'home')}
                    onRepost={() => onOpenRepostModal(mappedPost)}
                    onOpenReportPost={() => onOpenReportPost(mappedPost)}
                    onOpenChat={() => onOpenChat({ name: mappedPost.companyName, avatarUrl: mappedPost.avatar })}
                    onOpenProfile={isOwner ? onOpenMyProfile : () => onOpenOtherProfile(item.user)}
                    onOpenCommentSheet={() => onOpenCommentSheet(mappedPost)}
                    user={user}
                    token={token}
                    onShowToast={onShowToast}
                    onUpdateReactions={(reactions) => handleUpdateReactions(item.id, reactions)}
                />
            );
        }
        if (item.type === 'shipmentAd') {
            const mappedAd = {
                ...item,
                id: item._id,
                companyName: item.user.name,
                avatar: getFullImageUrl(item.user.avatar) || `https://ui-avatars.com/api/?name=${(item.user.name || '?').charAt(0)}&background=random&color=fff&size=50`,
                timeAgo: timeAgo(item.createdAt),
                from: item.pickupLocation,
                to: item.deliveryLocation,
                truckType: item.truckType,
                date: new Date(item.pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                description: item.description,
                media: item.media,
                user: item.user,
                reactions: item.reactions,
                comments: item.comments,
                shareCount: item.shareCount,
                repostCount: item.repostCount,
            };
            return (
                <ShipmentPost 
                    key={item.id}
                    post={mappedAd} 
                    isOwner={isOwner} 
                    onDeletePost={() => createDeleteHandler('shipmentAd', item.id)}
                    onDismiss={() => handleDismissPost(item.id)}
                    onEditPost={() => onOpenEditPost(mappedAd, 'home')}
                    onRepost={() => onOpenRepostModal(mappedAd)}
                    onOpenReportPost={() => onOpenReportPost(mappedAd)}
                    onOpenChat={() => onOpenChat({ name: mappedAd.companyName, avatarUrl: mappedAd.avatar })}
                    onOpenProfile={isOwner ? onOpenMyProfile : () => onOpenOtherProfile(item.user)}
                    onOpenCommentSheet={() => onOpenCommentSheet(mappedAd)}
                    user={user}
                    token={token}
                    onShowToast={onShowToast}
                    onUpdateReactions={(reactions) => handleUpdateReactions(item.id, reactions)}
                />
            );
        }
        if (item.type === 'emptyTruckAd') {
            const mappedAd = {
                ...item,
                id: item._id,
                companyName: item.user.name,
                avatar: getFullImageUrl(item.user.avatar) || `https://ui-avatars.com/api/?name=${(item.user.name || '?').charAt(0)}&background=random&color=fff&size=50`,
                timeAgo: timeAgo(item.createdAt),
                currentLocation: item.currentLocation,
                preferredDestination: item.preferredDestination,
                truckType: item.truckType,
                availabilityDate: new Date(item.availabilityDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                additionalNotes: item.additionalNotes,
                media: item.media,
                user: item.user,
                reactions: item.reactions,
                comments: item.comments,
                shareCount: item.shareCount,
                repostCount: item.repostCount,
            };
            return (
                <EmptyTruckAdPost 
                    key={item.id}
                    post={mappedAd} 
                    isOwner={isOwner} 
                    onDeletePost={() => createDeleteHandler('emptyTruckAd', item.id)}
                    onDismiss={() => handleDismissPost(item.id)}
                    onEditPost={() => onOpenEditPost(mappedAd, 'home')}
                    onRepost={() => onOpenRepostModal(mappedAd)}
                    onOpenReportPost={() => onOpenReportPost(mappedAd)}
                    onOpenChat={() => onOpenChat({ name: mappedAd.companyName, avatarUrl: mappedAd.avatar })}
                    onOpenProfile={isOwner ? onOpenMyProfile : () => onOpenOtherProfile(item.user)}
                    onOpenCommentSheet={() => onOpenCommentSheet(mappedAd)}
                    user={user}
                    token={token}
                    onShowToast={onShowToast}
                    onUpdateReactions={(reactions) => handleUpdateReactions(item.id, reactions)}
                />
            );
        }
        return null;
    };

    const feedContent = useMemo(() => {
        // FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
        // This is a safe alternative as React.ReactNode includes JSX elements.
        const items: (React.ReactNode | null)[] = [];
        posts.forEach((item, index) => {
            const postElement = (
                <div key={item.id} className={item.isNew ? 'new-post-enter' : ''}>
                    {renderPostItem(item)}
                </div>
            );
            items.push(postElement);

            if (index === 2) {
                items.push(
                    <SuggestedCompaniesSection 
                        key="suggested-companies"
                        companies={companies.slice(7)} 
                        isLoading={isLoadingCompanies}
                        error={companiesError}
                        onOpenOtherProfile={onOpenOtherProfile}
                        onOpenChat={onOpenChat}
                    />
                );
            }
        });
        return items;
    // FIX: Removed 'token' from the dependency array to resolve "Cannot find name 'token'" error.
    // The 'user' dependency already covers changes related to login/logout, making 'token' redundant
    // as `renderPostItem` fetches it from localStorage.
    }, [posts, companies, isLoadingCompanies, companiesError, onOpenOtherProfile, onOpenChat, user]);


  return (
    <div className={`app-container home-container ${className || ''}`}>
      <main ref={feedRef} className="app-content home-content-feed">
        <header className="home-header">
            <div className="header-top">
                <h1>الرئيسية</h1>
                <div className="header-actions">
                   <button className="header-icon" aria-label="ابحث عن شحنة" onClick={onOpenSearch}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button className="header-icon" aria-label="استكشاف الشركات" onClick={onOpenExplore}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5l3-3-3-3-3 3 3 3z" />
                        </svg>
                    </button>
                     <button className="header-icon" aria-label="الدردشات" onClick={onOpenChatList}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                    <button className="header-icon" aria-label="الإشعارات" onClick={onOpenNotifications}>
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                    <button className="header-icon" aria-label="الملف الشخصي" onClick={onOpenMyProfile}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            <button className="create-ad-container" onClick={onOpenCreateAdModal}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <p>إنشاء اعلان</p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16l2 2h3.5a1 1 0 001-1V9a1 1 0 00-1-1h-3.5l-2-2z" />
                </svg>
            </button>
            <div className="stories-container">
                {isLoadingCompanies && [...Array(5)].map((_, i) => <StoryCardSkeleton key={i} />)}
                {companiesError && <div className="stories-feedback error">{companiesError}</div>}
                {!isLoadingCompanies && !companiesError && companies.slice(0, 7).map(company => {
                    // Robustly get avatar and cover image paths.
                    const avatarPath = company.avatar || (company as any).avatarUrl;
                    const coverPath = company.coverImage || (company as any).cover;

                    const avatarUrl = avatarPath
                        ? getFullImageUrl(avatarPath)
                        : `https://ui-avatars.com/api/?name=${(company.name || '?').charAt(0)}&background=random&color=fff&size=60`;
                    
                    const coverImageUrl = coverPath ? getFullImageUrl(coverPath) : undefined;
                    
                    return (
                        <StoryCard 
                          key={company._id} 
                          avatarUrl={avatarUrl}
                          coverImageUrl={coverImageUrl}
                          name={company.name} 
                          rating={company.rating}
                          onOpenProfile={() => onOpenOtherProfile(company)} 
                          onOpenChat={() => onOpenChat(company)}
                        />
                    );
                })}
                {!isLoadingCompanies && !companiesError && <StoryCard isViewMore={true} name="عرض المزيد" />}
            </div>
        </header>
        
        <div className="shipment-feed">
            {(publishingType !== 'idle' && publishingStatus !== 'idle') && (
              <PublishingIndicator
                type={publishingType}
                status={publishingStatus}
                onComplete={() => {
                  setPublishingStatus('idle');
                  onPublishingComplete();
                }}
              />
            )}
            
            {isLoadingPosts && posts.length === 0 && (
              <>
                <ShipmentPostSkeleton />
                <GeneralPostSkeleton />
                <ShipmentPostSkeleton />
              </>
            )}
            {postsError && posts.length === 0 && <p style={{textAlign: 'center', padding: '20px', color: 'var(--danger-color)'}}>{postsError}</p>}
            
            {feedContent}

        </div>
      </main>
    </div>
  );
};

export default HomeScreen;