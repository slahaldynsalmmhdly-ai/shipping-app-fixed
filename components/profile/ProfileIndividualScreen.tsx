import React, { useState, useEffect, useMemo } from 'react';
import './Profile.css';
import { API_BASE_URL } from '../../config';
import type { CachedProfileData, Screen, ConfirmationModalConfig } from '../../App';
import ProfileIndividualSkeleton from './ProfileIndividualSkeleton';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('data:image') || url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

interface PostGridItemProps {
    item: any;
    isMyProfile: boolean;
    onDelete?: (postId: string) => void;
    onOpenPostDetail: (post: any) => void;
}

const PostGridItem: React.FC<PostGridItemProps> = ({ item, isMyProfile, onDelete, onOpenPostDetail }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const media = item.media && item.media[0];
    const likeCount = item.reactions?.length || 0;

    const getTextSnippet = () => {
        const text = item.text || item.description || item.additionalNotes || '';
        return text.substring(0, 50) + (text.length > 50 ? '...' : '');
    };
    
    const getPostTypeIcon = () => {
        if (item.pickupLocation) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
        if (item.currentLocation) return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16l2 2h3.5a1 1 0 001-1V9a1 1 0 00-1-1h-3.5l-2-2z" /></svg>;
        return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>;
    }

    return (
        <div style={{ position: 'relative' }}>
            {isMyProfile && onDelete && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            padding: 0
                        }}
                        aria-label="خيارات المنشور"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                    </button>
                    
                    {isMenuOpen && (
                        <>
                            <div 
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 998,
                                    background: 'transparent'
                                }}
                            />
                            <div 
                                style={{
                                    position: 'absolute',
                                    top: '40px',
                                    right: '0',
                                    background: 'var(--bg-secondary-color)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                    minWidth: '180px',
                                    zIndex: 999,
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setIsMenuOpen(false); 
                                        onDelete(item._id); 
                                    }}
                                    style={{
                                        padding: '14px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        color: 'var(--danger-color)',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    <span>حذف المنشور</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
            
            <button className="post-grid-item" onClick={() => onOpenPostDetail(item)}>
                {media ? (
                    media.type === 'video' 
                        ? <video src={getFullImageUrl(media.url)} muted playsInline />
                        : <img src={getFullImageUrl(media.url)} alt="Post thumbnail" />
                ) : (
                    <div className="text-thumbnail">
                        {getPostTypeIcon()}
                        <p>{getTextSnippet()}</p>
                    </div>
                )}
                <div className="grid-item-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9-22.23 22.23 0 01-2.949-2.58c-.196-.289-.38-.59-.555-.898a.5.5 0 01.908-.42A19.9 19.9 0 0010 15a19.9 19.9 0 005.157-2.071.5.5 0 01.908.42c-.175.308-.359.609-.555.898-1.135 1.664-2.64 3.2-4.53 4.487z" /><path d="M10 12.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z" /><path d="M10 3.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z" /><path d="M5.5 8a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z" /><path d="M14.5 8a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z" /></svg>
                    <span>{likeCount}</span>
                </div>
            </button>
        </div>
    );
};


interface ProfileIndividualScreenProps {
    className?: string;
    onNavigateBack: () => void;
    onLogout: () => void;
    onOpenEditProfile: () => void;
    profileCache: Map<string, CachedProfileData>;
    setProfileCache: React.Dispatch<React.SetStateAction<Map<string, CachedProfileData>>>;
    profileData: any | null;
    onOpenChat: (user: any) => void;
    onOpenVoiceCall: (user: any) => void;
    onOpenVideoCall: (user: any) => void;
    onOpenReportProfile: (user: any, origin: Screen) => void;
    profileOrigin: Screen;
    onOpenConfirmationModal: (config: Omit<ConfirmationModalConfig, 'isOpen'>) => void;
    onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    onOpenPostDetail: (post: any) => void;
}

const ProfileIndividualScreen: React.FC<ProfileIndividualScreenProps> = ({ 
    className, onNavigateBack, onLogout, onOpenEditProfile, profileCache, setProfileCache, profileData, onOpenChat, onOpenVoiceCall, onOpenVideoCall, onOpenReportProfile, profileOrigin, onOpenConfirmationModal, onShowToast, onOpenPostDetail
}) => {
    
    const isMyProfile = !profileData;
    const profileIdToFetch = isMyProfile ? 'me' : profileData?._id;
    const isActive = className?.includes('page-active');

    const [profile, setProfile] = useState<any | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [ads, setAds] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'ads'>('posts');

    const handleDeletePost = (postId: string) => {
        onOpenConfirmationModal({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.',
            confirmButtonText: 'نعم، احذف',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        onShowToast('يجب تسجيل الدخول أولاً', 'error');
                        return;
                    }
    
                    const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
    
                    if (!response.ok) {
                        const data = await response.json().catch(() => ({}));
                        throw new Error(data.message || 'فشل حذف المنشور');
                    }
    
                    setPosts(prev => prev.filter(p => p._id !== postId));

                    if (profileIdToFetch) {
                        setProfileCache(prev => {
                            const newCache = new Map(prev);
                            const cachedData = newCache.get(profileIdToFetch) as CachedProfileData | undefined;
                            if (cachedData) {
                                newCache.set(profileIdToFetch, {
                                    ...cachedData,
                                    posts: (cachedData.posts || []).filter((p: any) => p._id !== postId)
                                });
                            }
                            return newCache;
                        });
                    }
                    onShowToast('تم حذف المنشور بنجاح', 'success');
                    
                } catch (error: any) {
                    console.error('Error deleting post:', error);
                    onShowToast(error.message || 'حدث خطأ أثناء حذف المنشور', 'error');
                }
            }
        });
    };

    useEffect(() => {
        if (!isActive || !profileIdToFetch) {
            return;
        }

        const cachedData = profileCache.get(profileIdToFetch);

        if (cachedData && cachedData.posts !== undefined) {
            setProfile(cachedData.profile);
            setPosts(cachedData.posts || []);
            const allAds = [...(cachedData.shipmentAds || []), ...(cachedData.emptyTruckAds || [])];
            allAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setAds(allAds);
            setIsLoading(false);
            setError(null);
        } else {
            setIsLoading(true);
            setError(null);
            
            const loadAllData = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                    const profileEndpoint = isMyProfile ? `${API_BASE_URL}/api/v1/profile/me` : `${API_BASE_URL}/api/v1/profile/${profileIdToFetch}`;
                    
                    const profileRes = await fetch(profileEndpoint, { headers });
                    if (!profileRes.ok) throw new Error('Failed to fetch profile data.');
                    const newProfileData = await profileRes.json();
                    const id = newProfileData._id;
                    if (!id) throw new Error('Profile ID not found.');
                    
                    const [postsRes, shipmentAdsRes, emptyTruckAdsRes] = await Promise.all([
                        fetch(`${API_BASE_URL}/api/v1/posts/user/${id}`, { headers }),
                        fetch(`${API_BASE_URL}/api/v1/shipmentads/user/${id}`, { headers }),
                        fetch(`${API_BASE_URL}/api/v1/emptytruckads/user/${id}`, { headers }),
                    ]);

                    const newPosts: any[] = postsRes.ok ? await postsRes.json() : [];
                    const newShipmentAds: any[] = shipmentAdsRes.ok ? await shipmentAdsRes.json() : [];
                    const newEmptyTruckAds: any[] = emptyTruckAdsRes.ok ? await emptyTruckAdsRes.json() : [];
                    
                    const dataToCache: CachedProfileData = { 
                        profile: newProfileData, 
                        posts: newPosts,
                        shipmentAds: newShipmentAds,
                        emptyTruckAds: newEmptyTruckAds,
                        vehicles: [],
                        reviews: []
                    };
                    setProfileCache(prev => new Map(prev).set(profileIdToFetch!, dataToCache));
                    
                    setProfile(newProfileData);
                    setPosts(newPosts);
                    const allAds = [...newShipmentAds, ...newEmptyTruckAds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setAds(allAds);

                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            loadAllData();
        }
    }, [isActive, profileIdToFetch, profileCache, setProfileCache, isMyProfile]);
    

    if (isLoading) {
        return <ProfileIndividualSkeleton />;
    }

    if (error || !profile) {
        return (
            <div className={`app-container profile-container-individual tiktok-style ${className || ''}`}>
                <header className="profile-tiktok-header">
                     <button onClick={onNavigateBack} className="header-icon-btn back-btn" aria-label="الرجوع"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                     <h2> </h2>
                     <div style={{width: 40}}></div>
                </header>
                <div className="error-message-container" style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><p>{error || 'لم يتم العثور على الملف الشخصي.'}</p></div>
            </div>
        )
    }

    const targetUserForActions = {
        _id: profile._id,
        name: profile.name,
        avatarUrl: getFullImageUrl(profile.avatar) || '',
        userType: 'individual',
    };
    
    const itemsToShow = activeTab === 'posts' ? posts : ads;

    return (
        <div className={`app-container profile-container-individual tiktok-style ${className || ''}`}>
            <header className="profile-tiktok-header">
                <button onClick={onNavigateBack} className="header-icon-btn back-btn" aria-label="الرجوع"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                <h2>{profile.name}</h2>
                <button className="header-icon-btn" aria-label="خيارات" onClick={isMyProfile ? onLogout : () => onOpenReportProfile(targetUserForActions, 'profileIndividual')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                </button>
            </header>
            <main className="app-content profile-tiktok-content">
                <div className="profile-tiktok-info-wrapper">
                    <img 
                        src={getFullImageUrl(profile.avatar) || `https://ui-avatars.com/api/?name=${(profile.name || '?').charAt(0)}&background=random&color=fff&size=128`} 
                        alt={profile.name}
                        className="profile-tiktok-avatar"
                    />
                    <h3>@{profile.name.replace(/\s/g, '_').toLowerCase()}</h3>
                    
                    <div className="profile-tiktok-stats">
                        <div className="profile-tiktok-stat-item">
                            <span className="stat-item-number">{posts.length}</span>
                            <span className="stat-item-label">منشورات</span>
                        </div>
                         <div className="profile-tiktok-stat-item">
                            <span className="stat-item-number">{ads.length}</span>
                            <span className="stat-item-label">إعلانات</span>
                        </div>
                    </div>
                    
                    <div className="profile-tiktok-actions">
                        {isMyProfile ? (
                            <button className="btn btn-secondary" onClick={onOpenEditProfile}>تعديل الملف الشخصي</button>
                        ) : (
                            <>
                                <button className="btn btn-primary" onClick={() => onOpenChat(targetUserForActions)} disabled={profileOrigin === 'chat'}>مراسلة</button>
                                <button className="btn btn-secondary" onClick={() => onOpenVoiceCall(targetUserForActions)}>اتصال</button>
                            </>
                        )}
                    </div>
                    {profile.description && <p className="profile-tiktok-bio">{profile.description}</p>}
                </div>

                <div className="profile-tiktok-tabs">
                    <button className={`profile-tiktok-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                    </button>
                    <button className={`profile-tiktok-tab ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16l2 2h3.5a1 1 0 001-1V9a1 1 0 00-1-1h-3.5l-2-2z" /></svg>
                    </button>
                </div>

                <div className="profile-tiktok-grid">
                    {itemsToShow.length > 0 ? (
                        itemsToShow.map(item => (
                            <PostGridItem 
                                key={item._id} 
                                item={item} 
                                isMyProfile={isMyProfile}
                                onDelete={activeTab === 'posts' ? handleDeletePost : undefined}
                                onOpenPostDetail={onOpenPostDetail}
                            />
                        ))
                    ) : (
                        <p className="no-data-message" style={{ gridColumn: '1 / -1' }}>لا يوجد محتوى لعرضه.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfileIndividualScreen;