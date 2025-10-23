import React, { useState, useEffect } from 'react';
import './Profile.css';
import GeneralPost from '../home/GeneralPost';
import RepostedPost from '../home/RepostedPost'; // New Import
import ShipmentPost from '../home/ShipmentPost';
import EmptyTruckAdPost from '../home/EmptyTruckAdPost';
import FleetVehicleCard from './FleetVehicleCard'; // This is now the COMPACT card
import type { Vehicle, Screen, ToastType } from '../../App';
import { API_BASE_URL } from '../../config';
import ProfileCompanySkeleton from './ProfileCompanySkeleton';
import './ProfileCompanySkeleton.css';
import TruncatedText from '../shared/TruncatedText';


const getFullImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }
  if (url.startsWith('data:image') || url.startsWith('http')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

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


const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    // A single, robust path for a standard star.
    const starPath = "m5.825 21 2.325-7.6-5.6-5.45 7.625-1.125L12 0l2.825 6.825 7.625 1.125-5.6 5.45L19.175 21 12 17.275Z";
    // A consistent color for the empty part of the rating.
    const emptyStarColor = "#e0e0e0";

    return (
        <div className="star-rating">
            {/* Render full stars */}
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d={starPath} />
                </svg>
            ))}
            
            {/* Render a half star if needed, using a robust clip-path method for RTL */}
            {halfStar && (
                <svg key="half" viewBox="0 0 24 24">
                    <defs>
                        <clipPath id="half-star-clip-rtl">
                            {/* This rectangle covers the RIGHT half of the star for RTL display */}
                            <rect x="12" y="0" width="12" height="24" />
                        </clipPath>
                    </defs>
                    {/* Render the empty star in the background */}
                    <path d={starPath} fill={emptyStarColor} />
                    {/* Render the filled star in the foreground, clipped to show only the right half */}
                    <path d={starPath} fill="currentColor" clipPath="url(#half-star-clip-rtl)" />
                </svg>
            )}

            {/* Render remaining empty stars */}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} viewBox="0 0 24 24" fill={emptyStarColor}>
                    <path d={starPath} />
                </svg>
            ))}
        </div>
    );
};

interface CompanyProfile {
    _id: string;
    name: string;
    email: string;
    userType?: 'individual' | 'company';
    coverImage?: string;
    cover?: string;
    avatar?: string;
    avatarUrl?: string; // Keep for prop compatibility
    companyName?: string;
    description?: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
    fleetImages?: string[];
    licenseImages?: string[];
    truckCount?: number;
    truckTypes?: string;
    address?: string;
    city?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  media?: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  profile: string;
  createdAt: string;
}

interface CachedProfileData {
    profile: CompanyProfile;
    vehicles: Vehicle[];
    reviews: Review[];
    posts: any[];
    shipmentAds: any[];
    emptyTruckAds: any[];
}

interface ProfileCompanyScreenProps {
    className?: string; 
    onNavigateBack: () => void; 
    onEditProfile: () => void; 
    onLogout: () => void;
    onOpenReportPost: (post: any) => void;
    onOpenReportProfile: (user: any, origin: Screen) => void;
    onOpenChat: (user: any) => void;
    onOpenVoiceCall: (user: any) => void;
    onOpenVideoCall: (user: any) => void;
    onOpenFleetManagement: () => void;
    onOpenAddReviewModal: (profile: any) => void;
    onOpenDeleteReviewModal: (review: any) => void;
    onOpenCommentSheet: (post: any) => void;
    onOpenRepostModal: (post: any) => void;
    onOpenEditPost: (post: any, origin: Screen) => void;
    profileData: { _id?: string, name: string; avatarUrl: string; } | null;
    profileOrigin: Screen;
    profileVersion: number;
    profileCache: Map<string, any>;
    setProfileCache: React.Dispatch<React.SetStateAction<Map<string, any>>>;
    onOpenConfirmationModal: (config: { title: string, message: string, onConfirm: () => void }) => void;
    addDeletedItemId: (itemId: string) => void;
    onShowToast: (message: string, type: ToastType) => void;
    user: any;
}

const ProfileCompanyScreen: React.FC<ProfileCompanyScreenProps> = ({ 
    className, onNavigateBack, onEditProfile, onLogout, onOpenReportPost, onOpenReportProfile, onOpenChat, onOpenVoiceCall, onOpenVideoCall, onOpenFleetManagement, 
    onOpenAddReviewModal, onOpenDeleteReviewModal, onOpenCommentSheet, onOpenRepostModal, onOpenEditPost, profileData, profileOrigin, profileVersion, profileCache, setProfileCache, onOpenConfirmationModal, addDeletedItemId, onShowToast, user
}) => {
    const isMyProfile = !profileData;
    const profileIdToFetch = isMyProfile ? 'me' : profileData?._id;
    const isActive = className?.includes('page-active');

    const [activeTab, setActiveTab] = useState<'posts' | 'ads' | 'reviews'>('posts');
    const [openReviewMenuId, setOpenReviewMenuId] = useState<string | null>(null);
    
    const cachedDataOnMount = profileIdToFetch ? profileCache.get(profileIdToFetch) : undefined;

    // Data states
    const [profile, setProfile] = useState<CompanyProfile | null>(cachedDataOnMount?.profile ?? null);
    const [reviews, setReviews] = useState<Review[]>(cachedDataOnMount?.reviews ?? []);
    const [vehicles, setVehicles] = useState<Vehicle[]>(cachedDataOnMount?.vehicles ?? []);
    const [posts, setPosts] = useState<any[]>(cachedDataOnMount?.posts ?? []);
    const [shipmentAds, setShipmentAds] = useState<any[]>(cachedDataOnMount?.shipmentAds ?? []);
    const [emptyTruckAds, setEmptyTruckAds] = useState<any[]>(cachedDataOnMount?.emptyTruckAds ?? []);

    
    // Control states
    const [isLoading, setIsLoading] = useState(!cachedDataOnMount || cachedDataOnMount.posts === undefined);
    const [error, setError] = useState<string | null>(null);

    const getToken = () => localStorage.getItem("authToken");

    const handleReportReview = (reviewToReport: Review) => {
        setOpenReviewMenuId(null);
        onOpenReportPost(reviewToReport);
    };


    const isIndividualProfile = profile?.userType === 'individual';

    // Effect to handle switching away from a now-hidden tab
    useEffect(() => {
        if (isIndividualProfile && activeTab === 'reviews') {
            setActiveTab('posts');
        }
    }, [isIndividualProfile, activeTab]);

    const handleUpdateReactions = (itemId: string, newReactions: any[]) => {
        const updateState = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
            setter(prevItems =>
                prevItems.map(item =>
                    item._id === itemId ? { ...item, reactions: newReactions } : item
                )
            );
        };
        updateState(setPosts);
        updateState(setShipmentAds);
        updateState(setEmptyTruckAds);
    
        // Also update the cache
        if (profileIdToFetch) {
            setProfileCache(prevCache => {
                const newCache = new Map(prevCache);
                const cachedData = newCache.get(profileIdToFetch) as CachedProfileData | undefined;
                if (cachedData) {
                    const updatedCachedData = {
                        ...cachedData,
                        posts: (cachedData.posts || []).map(item => item._id === itemId ? { ...item, reactions: newReactions } : item),
                        shipmentAds: (cachedData.shipmentAds || []).map(item => item._id === itemId ? { ...item, reactions: newReactions } : item),
                        emptyTruckAds: (cachedData.emptyTruckAds || []).map(item => item._id === itemId ? { ...item, reactions: newReactions } : item),
                    };
                    newCache.set(profileIdToFetch, updatedCachedData);
                }
                return newCache;
            });
        }
    };

    const createDeleteHandler = (itemType: 'post' | 'shipment' | 'emptyTruck', itemId: string) => {
        onOpenConfirmationModal({
            title: "تأكيد الحذف",
            message: "هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
            onConfirm: async () => {
                if (!profileIdToFetch) return;

                let originalData: any[] = [];
                let optimisticUpdate: () => void = () => {};
                let revertUpdate: () => void = () => {};
                let endpoint = '';
                let cacheKey: keyof CachedProfileData | null = null;

                if (itemType === 'post') {
                    originalData = [...posts];
                    optimisticUpdate = () => setPosts(prev => prev.filter(p => p._id !== itemId));
                    revertUpdate = () => setPosts(originalData);
                    endpoint = `${API_BASE_URL}/api/v1/posts/${itemId}`;
                    cacheKey = 'posts';
                } else if (itemType === 'shipment') {
                    originalData = [...shipmentAds];
                    optimisticUpdate = () => setShipmentAds(prev => prev.filter(ad => ad._id !== itemId));
                    revertUpdate = () => setShipmentAds(originalData);
                    endpoint = `${API_BASE_URL}/api/v1/shipmentads/${itemId}`;
                    cacheKey = 'shipmentAds';
                } else { // emptyTruck
                    originalData = [...emptyTruckAds];
                    optimisticUpdate = () => setEmptyTruckAds(prev => prev.filter(ad => ad._id !== itemId));
                    revertUpdate = () => setEmptyTruckAds(originalData);
                    endpoint = `${API_BASE_URL}/api/v1/emptytruckads/${itemId}`;
                    cacheKey = 'emptyTruckAds';
                }

                // Optimistic UI update
                optimisticUpdate();
                addDeletedItemId(itemId);
                
                try {
                    const res = await fetch(endpoint, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${getToken()}` }
                    });

                    if (!res.ok) {
                         const errorData = await res.json();
                         throw new Error(errorData.message || "فشل الحذف");
                    }

                    // On success, update the cache permanently
                    if (cacheKey) {
                        setProfileCache(prev => {
                            const newCache = new Map(prev);
                            const cachedData = newCache.get(profileIdToFetch) as CachedProfileData | undefined;
                            if (cachedData && cacheKey && Array.isArray(cachedData[cacheKey])) {
                                const typedCacheKey = cacheKey as keyof Pick<CachedProfileData, 'posts' | 'shipmentAds' | 'emptyTruckAds'>;
                                const updatedItems = (cachedData[typedCacheKey] as any[]).filter(item => item._id !== itemId);
                                newCache.set(profileIdToFetch, { ...cachedData, [typedCacheKey]: updatedItems });
                            }
                            return newCache;
                        });
                    }
                    onShowToast('تم الحذف بنجاح', 'success');
                } catch (err: any) {
                    // Revert UI on failure
                    revertUpdate();
                    onShowToast(err.message, 'error');
                }
            }
        });
    };

    // Effect to invalidate 'me' cache when a refresh is triggered (e.g., from Edit Profile)
    useEffect(() => {
        if (isMyProfile && profileVersion > 0) {
            setProfileCache(prev => {
                const newCache = new Map(prev);
                newCache.delete('me');
                return newCache;
            });
            setIsLoading(true);
        }
    }, [profileVersion, isMyProfile, setProfileCache]);

    // This effect is now the single source of truth for fetching data or loading from cache.
    useEffect(() => {
        if (!isActive || !profileIdToFetch) {
            return;
        }

        const cachedData = profileCache.get(profileIdToFetch);

        if (cachedData && cachedData.posts !== undefined) {
            // Data is in cache, so we use it directly.
            setProfile(cachedData.profile);
            setReviews(cachedData.reviews);
            setVehicles(cachedData.vehicles);
            setPosts(cachedData.posts);
            setShipmentAds(cachedData.shipmentAds);
            setEmptyTruckAds(cachedData.emptyTruckAds);
            setIsLoading(false);
            setError(null);
        } else {
            // Data is not in cache or is stale, so we need to fetch it.
            setIsLoading(true);
            setError(null);
            
            const loadAllData = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                    const profileEndpoint = isMyProfile 
                        ? `${API_BASE_URL}/api/v1/profile/me` 
                        : `${API_BASE_URL}/api/v1/profile/${profileIdToFetch}`;
                    
                    const profileRes = await fetch(profileEndpoint, { headers });
                    if (!profileRes.ok) throw new Error('فشل في جلب بيانات الملف الشخصي.');
                    const newProfileData: CompanyProfile = await profileRes.json();
                    const id = newProfileData._id;
                    if (!id) throw new Error('لم يتم العثور على معرف الملف الشخصي.');

                    const vehiclesEndpoint = isMyProfile
                      ? `${API_BASE_URL}/api/vehicles/my-vehicles`
                      : `${API_BASE_URL}/api/vehicles/user/${id}`;
                    const reviewsEndpoint = `${API_BASE_URL}/api/reviews/${id}`;
                    const postsEndpoint = `${API_BASE_URL}/api/v1/posts/user/${id}`;
                    const shipmentAdsEndpoint = `${API_BASE_URL}/api/v1/shipmentads/user/${id}`;
                    const emptyTruckAdsEndpoint = `${API_BASE_URL}/api/v1/emptytruckads/user/${id}`;


                    const [vehiclesRes, reviewsRes, postsRes, shipmentAdsRes, emptyTruckAdsRes] = await Promise.all([
                        fetch(vehiclesEndpoint, { headers }),
                        fetch(reviewsEndpoint, { headers }),
                        fetch(postsEndpoint, { headers }),
                        fetch(shipmentAdsEndpoint, { headers }),
                        fetch(emptyTruckAdsEndpoint, { headers }),
                    ]);

                    let newVehicles: Vehicle[] = [];
                    if (vehiclesRes.ok) {
                        const vehiclesData = await vehiclesRes.json();
                        newVehicles = vehiclesData.map((v: any) => ({
                            id: v._id, driverName: v.driverName, vehicleName: v.vehicleName, licensePlate: v.licensePlate, imageUrl: v.imageUrl, vehicleType: v.vehicleType, currentLocation: v.currentLocation, color: v.vehicleColor, model: v.vehicleModel, status: v.status || 'متاح'
                        }));
                    }
                    
                    const newReviews: Review[] = reviewsRes.ok ? (await reviewsRes.json()).data || [] : [];
                    const newPosts: any[] = postsRes.ok ? await postsRes.json() : [];
                    const newShipmentAds: any[] = shipmentAdsRes.ok ? await shipmentAdsRes.json() : [];
                    const newEmptyTruckAds: any[] = emptyTruckAdsRes.ok ? await emptyTruckAdsRes.json() : [];
                    
                    const dataToCache: CachedProfileData = { 
                        profile: newProfileData, 
                        vehicles: newVehicles, 
                        reviews: newReviews,
                        posts: newPosts,
                        shipmentAds: newShipmentAds,
                        emptyTruckAds: newEmptyTruckAds
                     };
                    setProfileCache(prev => new Map(prev).set(profileIdToFetch!, dataToCache));
                    
                    setProfile(newProfileData);
                    setVehicles(newVehicles);
                    setReviews(newReviews);
                    setPosts(newPosts);
                    setShipmentAds(newShipmentAds);
                    setEmptyTruckAds(newEmptyTruckAds);

                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            loadAllData();
        }
    }, [isActive, profileIdToFetch, profileCache, setProfileCache, isMyProfile, profileVersion]);
    
    


    if (isLoading) {
        return (
            <div className={`app-container profile-container ${className || ''}`}>
                <main className="app-content" style={{ padding: 0 }}>
                    <ProfileCompanySkeleton />
                </main>
            </div>
        )
    }

    if (error) {
         return (
            <div className={`app-container profile-container ${className || ''}`}>
                 <header className="profile-header-company">
                    <div className="profile-cover"></div>
                 </header>
                 <main className="app-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '80px' }}>
                    <p style={{color: 'var(--danger-color)'}}>{error}</p>
                </main>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className={`app-container profile-container ${className || ''}`}>
                 <main className="app-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p>لا توجد بيانات للملف الشخصي.</p>
                </main>
            </div>
        )
    }
    
    const company = {
        _id: profile._id,
        name: profile.companyName || profile.name || '',
        email: profile.email || '',
        coverUrl: getFullImageUrl(profile.coverImage || profile.cover),
        avatarUrl: getFullImageUrl(profile.avatar || profile.avatarUrl),
        description: profile.description || '',
        rating: profile.rating ?? 0,
        reviewCount: profile.reviewCount ?? 0,
        fleetImages: profile.fleetImages ?? [],
        licenseImages: profile.licenseImages ?? [],
        address: profile.address || '',
        city: profile.city || '',
        truckCount: profile.truckCount ?? 0,
        truckTypes: profile.truckTypes || '',
    };
    
    const hasCompanyDetails = (company.address && company.city) || (company.truckCount > 0 || company.truckTypes) || profile.phone || company.email;
    const hasIndividualDetails = profile.phone || company.email;

    const targetUserForActions = {
        _id: profile._id,
        name: company.name,
        avatarUrl: company.avatarUrl || '',
        userType: profile.userType || 'company',
    };
    
    const allAds = [
        ...shipmentAds.map(ad => ({ ...ad, type: 'shipmentAd' })),
        ...emptyTruckAds.map(ad => ({ ...ad, type: 'emptyTruckAd' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const token = getToken();

    return (
    <div className={`app-container profile-container ${className || ''}`}>
        <header className="profile-header-company">
            <div className="profile-cover">
                {company.coverUrl && <img src={company.coverUrl} alt="Company Cover" />}
            </div>
            <div className="profile-avatar-wrapper">
                 {company.avatarUrl && <img src={company.avatarUrl} alt="Company Avatar" className="profile-avatar-img"/>}
            </div>
        </header>

        <main className="app-content profile-content-company">
            <div className="company-info-header">
                <div className="company-name-container">
                     <div className="company-name-verified">
                        <h1>{company.name}</h1>
                        {!isIndividualProfile && <svg className="verified-badge" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM7.854 14.854a.5.5 0 00.708 0L14.5 8.914a.5.5 0 10-.708-.708L8.5 13.793l-1.646-1.647a.5.5 0 10-.708.708l2 2z" clipRule="evenodd" /></svg>}
                    </div>
                    {!isIndividualProfile && (
                        <div className="company-rating-summary">
                            <StarRating rating={company.rating} />
                            <span>{company.rating.toFixed(1)} ({company.reviewCount} تقييم)</span>
                        </div>
                    )}
                </div>

                <div className="profile-header-actions">
                     {isMyProfile ? (
                        <>
                            <button onClick={onNavigateBack} className="edit-profile-icon-btn" aria-label="الرجوع">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <button onClick={onEditProfile} className="edit-profile-icon-btn" aria-label="تعديل الملف الشخصي">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            </button>
                           {!isIndividualProfile && (
                                <button className="edit-profile-icon-btn" aria-label="مكالمة جماعية للأسطول">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                    </svg>
                                </button>
                           )}
                            <button onClick={onLogout} className="edit-profile-icon-btn" aria-label="تسجيل الخروج">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                            </button>
                        </>
                    ) : (
                         <>
                            <button className="profile-action-icon-btn" onClick={() => onOpenChat(targetUserForActions)} aria-label="مراسلة" disabled={isMyProfile || profileOrigin === 'chat'}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </button>
                            <button className="profile-action-icon-btn" onClick={() => onOpenVoiceCall(targetUserForActions)} aria-label="مكالمة صوتية">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                            </button>
                            <button className="profile-action-icon-btn" onClick={() => onOpenVideoCall(targetUserForActions)} aria-label="مكالمة فيديو">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>
                            </button>
                            <button className="profile-action-icon-btn secondary" onClick={() => onOpenReportProfile(targetUserForActions, 'profileCompany')} aria-label="إبلاغ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
                            </button>
                            <button className="profile-action-icon-btn secondary" onClick={onNavigateBack} aria-label="خروج">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!isIndividualProfile && (
                <section className="profile-section fleet-compact-section">
                    <div className="fleet-compact-header">
                        <h2>أسطولنا</h2>
                        {isMyProfile && (
                            <button onClick={onOpenFleetManagement} className="manage-fleet-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.165.397.505.71.93.78l.894.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.894.149c-.425.07-.765.383-.93.78-.164.398-.142.854.108 1.204l.527.738c.32.447.27.96-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.149c-.542-.09-.94-.56-.94-1.11v-1.094c0 .55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.164-.398.142.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>إدارة</span>
                            </button>
                        )}
                    </div>
                    <div className="fleet-compact-scroll-container">
                        {vehicles.length > 0 ? (
                            vehicles.map(vehicle => (
                                <FleetVehicleCard 
                                    key={vehicle.id} 
                                    vehicle={vehicle}
                                    onOpenChat={() => onOpenChat({ 
                                        name: vehicle.driverName, 
                                        avatarUrl: getFullImageUrl(vehicle.imageUrl)! 
                                    })} 
                                />
                            ))
                        ) : (
                            <p className="no-data-message">لم تتم إضافة أي مركبات للأسطول بعد.</p>
                        )}
                    </div>
                </section>
            )}
            
            {!isIndividualProfile && company.fleetImages.length > 0 && (
                <section className="profile-section fleet-photos-section">
                    <h2>صور الأسطول</h2>
                    <div className="fleet-photos-display-container">
                        {company.fleetImages.map((img, index) => (
                            <div key={index} className="fleet-photo-display-item">
                                <img src={getFullImageUrl(img)} alt={`Fleet photo ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {!isIndividualProfile && company.licenseImages && company.licenseImages.length > 0 && (
                <section className="profile-section fleet-photos-section">
                    <h2>صور التراخيص</h2>
                    <div className="fleet-photos-display-container">
                        {company.licenseImages.map((img, index) => (
                            <div key={index} className="fleet-photo-display-item">
                                <img src={getFullImageUrl(img)} alt={`License photo ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {company.description && (
                <section className="profile-section">
                    <h2>{isIndividualProfile ? 'نبذة' : 'نبذة عن الشركة'}</h2>
                    <p>{company.description}</p>
                </section>
            )}

            {(hasCompanyDetails || hasIndividualDetails) && (
                 <section className="profile-section company-details-section">
                    <h2>{isIndividualProfile ? 'معلومات التواصل' : 'معلومات الشركة'}</h2>
                    <div className="company-details-grid">
                        {!isIndividualProfile && (company.address && company.city) && (
                            <div className="detail-grid-item">
                                <div className="info-item-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.223.654-.369.254-.145.546-.32.84-.523.295-.203.618-.45.945-.737.327-.287.666-.612.988-.962a10 10 0 002.33-4.475 8 8 0 10-16 0 10 10 0 002.33 4.475c.322.35.66.675.988.962.327.287.65.534.945.737.294.203.586.378.84.523.254-.146.468.269.654.369a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="info-item-content">
                                    <span className="info-item-label">العنوان</span>
                                    <span className="info-item-value">{`${company.address}, ${company.city}`}</span>
                                </div>
                            </div>
                        )}
                        {!isIndividualProfile && (company.truckCount > 0 || company.truckTypes) && (
                            <div className="detail-grid-item">
                                <div className="info-item-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16l2 2h3.5a1 1 0 001-1V9a1 1 0 00-1-1h-3.5l-2-2z" /></svg>
                                </div>
                                <div className="info-item-content">
                                    <span className="info-item-label">الأسطول</span>
                                    <span className="info-item-value">{company.truckTypes ? `${company.truckCount} شاحنات (${company.truckTypes})` : `${company.truckCount} شاحنات`}</span>
                                </div>
                            </div>
                        )}
                        {profile.phone && (
                            <div className="detail-grid-item">
                                <div className="info-item-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <div className="info-item-content">
                                    <span className="info-item-label">رقم الهاتف</span>
                                    <span className="info-item-value">{profile.phone}</span>
                                </div>
                            </div>
                        )}
                        {company.email && (
                            <div className="detail-grid-item">
                                <div className="info-item-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="info-item-content">
                                    <span className="info-item-label">البريد الإلكتروني</span>
                                    <span className="info-item-value">{company.email}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {!isMyProfile && !isIndividualProfile && (
                <section className="add-review-prompt-section">
                    <button className="add-review-prompt-btn" onClick={() => onOpenAddReviewModal(profile)}>
                        أضف تقييمًا
                    </button>
                </section>
            )}
            
            <section className="profile-section profile-posts-section">
                 <div className="profile-tabs-nav">
                    <button 
                        className={`profile-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                        aria-selected={activeTab === 'posts'}
                    >
                        المنشورات
                    </button>
                    <button 
                        className={`profile-tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ads')}
                        aria-selected={activeTab === 'ads'}
                    >
                        الإعلانات
                    </button>
                    {!isIndividualProfile && (
                        <button 
                            className={`profile-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                            aria-selected={activeTab === 'reviews'}
                        >
                            التقييمات
                        </button>
                    )}
                </div>
                <div className="profile-tab-content">
                    {activeTab === 'posts' && (
                        <div className="profile-posts-list">
                            {posts.length > 0 ? (
                                posts.map(post => {
                                    const mappedPost = {
                                        ...post,
                                        id: post._id,
                                        companyName: profile.companyName || profile.name,
                                        avatar: getFullImageUrl(profile.avatar || profile.avatarUrl) || `https://ui-avatars.com/api/?name=${((profile.companyName || profile.name) || '?').charAt(0)}&background=random&color=fff&size=50`,
                                        timeAgo: timeAgo(post.createdAt),
                                        user: profile,
                                    };
                                    if (post.isRepost && post.originalPost) {
                                        return (
                                            <RepostedPost
                                                key={post._id}
                                                post={mappedPost}
                                                isOwner={isMyProfile}
                                                onDeletePost={() => createDeleteHandler('post', post._id)}
                                                onOpenReportPost={() => onOpenReportPost(mappedPost)}
                                                onOpenChat={() => onOpenChat(targetUserForActions)}
                                                onOpenProfile={() => {}}
                                                onOpenCommentSheet={() => onOpenCommentSheet(mappedPost)}
                                                user={user}
                                                token={token}
                                                onShowToast={onShowToast}
                                                onUpdateReactions={(reactions) => handleUpdateReactions(post._id, reactions)}
                                            />
                                        );
                                    }
                                    return (
                                        <GeneralPost
                                            key={mappedPost.id}
                                            post={mappedPost}
                                            isOwner={isMyProfile}
                                            onDeletePost={() => createDeleteHandler('post', post._id)}
                                            onEditPost={() => onOpenEditPost(mappedPost, 'profileCompany')}
                                            onRepost={() => onOpenRepostModal(mappedPost)}
                                            onOpenReportPost={() => onOpenReportPost(mappedPost)}
                                            onOpenChat={() => onOpenChat(targetUserForActions)}
                                            onOpenProfile={() => {}}
                                            onOpenCommentSheet={() => onOpenCommentSheet(mappedPost)}
                                            user={user}
                                            token={token}
                                            onShowToast={onShowToast}
                                            onUpdateReactions={(reactions) => handleUpdateReactions(post._id, reactions)}
                                        />
                                    );
                                })
                            ) : (
                                <p className="no-data-message">لا توجد منشورات لعرضها.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'ads' && (
                        <div className="profile-posts-list">
                            {allAds.length > 0 ? (
                                allAds.map(ad => {
                                    if (ad.type === 'shipmentAd') {
                                        const mappedAd = {
                                            ...ad,
                                            id: ad._id,
                                            companyName: profile.companyName || profile.name,
                                            avatar: getFullImageUrl(profile.avatar || profile.avatarUrl) || `https://ui-avatars.com/api/?name=${((profile.companyName || profile.name) || '?').charAt(0)}&background=random&color=fff&size=50`,
                                            timeAgo: timeAgo(ad.createdAt),
                                            from: ad.pickupLocation,
                                            to: ad.deliveryLocation,
                                            truckType: ad.truckType,
                                            date: new Date(ad.pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                                            description: ad.description,
                                            media: ad.media,
                                            user: profile,
                                            reactions: ad.reactions,
                                            comments: ad.comments,
                                            shareCount: ad.shareCount,
                                            repostCount: ad.repostCount,
                                        };
                                        return (
                                            <ShipmentPost
                                                key={ad._id}
                                                post={mappedAd}
                                                isOwner={isMyProfile}
                                                onDeletePost={() => createDeleteHandler('shipment', ad._id)}
                                                onEditPost={() => onOpenEditPost(mappedAd, 'profileCompany')}
                                                onRepost={() => onOpenRepostModal(mappedAd)}
                                                onOpenReportPost={() => onOpenReportPost(mappedAd)}
                                                onOpenChat={() => onOpenChat(targetUserForActions)}
                                                onOpenProfile={() => {}} // Do nothing on profile click
                                                onOpenCommentSheet={() => onOpenCommentSheet(mappedAd)}
                                                user={user}
                                                token={token}
                                                onShowToast={onShowToast}
                                                onUpdateReactions={(reactions) => handleUpdateReactions(ad._id, reactions)}
                                            />
                                        );
                                    } else { // ad.type === 'emptyTruckAd'
                                        const mappedAd = {
                                            ...ad,
                                            id: ad._id,
                                            companyName: profile.companyName || profile.name,
                                            avatar: getFullImageUrl(profile.avatar || profile.avatarUrl) || `https://ui-avatars.com/api/?name=${((profile.companyName || profile.name) || '?').charAt(0)}&background=random&color=fff&size=50`,
                                            timeAgo: timeAgo(ad.createdAt),
                                            currentLocation: ad.currentLocation,
                                            preferredDestination: ad.preferredDestination,
                                            truckType: ad.truckType,
                                            availabilityDate: new Date(ad.availabilityDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                                            additionalNotes: ad.additionalNotes,
                                            media: ad.media,
                                            user: profile,
                                            reactions: ad.reactions,
                                            comments: ad.comments,
                                            shareCount: ad.shareCount,
                                            repostCount: ad.repostCount,
                                        };
                                        return (
                                            <EmptyTruckAdPost
                                                key={ad._id}
                                                post={mappedAd}
                                                isOwner={isMyProfile}
                                                onDeletePost={() => createDeleteHandler('emptyTruck', ad._id)}
                                                onEditPost={() => onOpenEditPost(mappedAd, 'profileCompany')}
                                                onRepost={() => onOpenRepostModal(mappedAd)}
                                                onOpenReportPost={() => onOpenReportPost(mappedAd)}
                                                onOpenChat={() => onOpenChat(targetUserForActions)}
                                                onOpenProfile={() => {}} // Do nothing on profile click
                                                onOpenCommentSheet={() => onOpenCommentSheet(mappedAd)}
                                                user={user}
                                                token={token}
                                                onShowToast={onShowToast}
                                                onUpdateReactions={(reactions) => handleUpdateReactions(ad._id, reactions)}
                                            />
                                        );
                                    }
                                })
                            ) : (
                                <p className="no-data-message">لا توجد إعلانات لعرضها.</p>
                            )}
                        </div>
                    )}
                    {!isIndividualProfile && activeTab === 'reviews' && (
                       <div className="reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review._id} className="review-card">
                                        <div className="review-header">
                                            <img src={getFullImageUrl(review.author?.avatar) || `https://ui-avatars.com/api/?name=${(review.author?.name || '?').charAt(0)}&background=random&color=fff&size=40`} alt={review.author?.name || 'مستخدم محذوف'} />
                                            <div className="review-info">
                                                <h4>{review.author?.name || 'مستخدم محذوف'}</h4>
                                                <div className="review-meta">
                                                  <StarRating rating={review.rating} />
                                                  <span className="review-date">{timeAgo(review.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="post-menu-wrapper">
                                                <button className="post-icon-btn" aria-label="المزيد" onClick={(e) => { e.stopPropagation(); setOpenReviewMenuId(review._id === openReviewMenuId ? null : review._id); }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                                    </svg>
                                                </button>
                                                {openReviewMenuId === review._id && (
                                                    <>
                                                        <div className="post-menu-backdrop" onClick={(e) => { e.stopPropagation(); setOpenReviewMenuId(null); }}></div>
                                                        <div className="post-menu-popover">
                                                            <ul>
                                                                <li onClick={(e) => { e.stopPropagation(); handleReportReview(review); }}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
                                                                    <span>الإبلاغ عن هذا التقييم</span>
                                                                </li>
                                                                {isMyProfile && (
                                                                    <li className="danger" onClick={(e) => { e.stopPropagation(); onOpenDeleteReviewModal(review); setOpenReviewMenuId(null); }}>
                                                                        {/* FIX: Corrected syntax for strokeWidth attribute in SVG */}
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        <span>حذف التقييم</span>
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <TruncatedText text={review.comment} className="review-text" charLimit={150} />
                                        {review.media && review.media.length > 0 && (
                                            <div className="review-media-gallery">
                                                {review.media.map((url, index) => (
                                                    <div key={index} className="review-media-item-wrapper">
                                                        {url.includes('video') ? (
                                                            <video src={getFullImageUrl(url)} controls className="review-media-item" />
                                                        ) : (
                                                            <img src={getFullImageUrl(url)} alt={`review-media-${index}`} className="review-media-item" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="no-data-message">لا توجد تقييمات لعرضها.</p>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    </div>
    );
};

export default ProfileCompanyScreen;