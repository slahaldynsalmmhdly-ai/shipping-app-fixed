

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from './config';
import type { MediaConnection } from 'peerjs';
import { peerManager } from './utils/audioCall';

import SplashScreen from './components/splash/SplashScreen';
import HomeScreen from './components/home/HomeScreen';
import HistoryScreen from './components/history/HistoryScreen';
import NotificationsScreen from './components/notifications/NotificationsScreen';
import NotificationDetailScreen from './components/notifications/NotificationDetailScreen'; // New Import
import SearchScreen from './components/search/SearchScreen';
import LiveTrackingScreen from './components/tracking/LiveTrackingScreen';
import ForgotPasswordModal from './components/auth/ForgotPasswordModal';
import AccountTypeSelectionModal from './components/auth/AccountTypeSelectionModal';
import SignUpIndividualScreen from './components/signup/SignUpIndividualScreen';
import SignUpCompanyScreen from './components/signup/SignUpCompanyScreen';
import CreateCompanyProfileScreen from './components/signup/CreateCompanyProfileScreen';
import CreateAdModal from './components/ads/CreateAdModal';
import CreateCargoAdScreen from './components/ads/CreateCargoAdScreen';
import CreateTruckAdScreen from './components/ads/CreateTruckAdScreen';
import CreatePostScreen from './components/posts/CreatePostScreen';
import ProfileIndividualScreen from './components/profile/ProfileIndividualScreen';
import ProfileCompanyScreen from './components/profile/ProfileCompanyScreen';
import EditProfileCompanyScreen from './components/profile/EditProfileCompanyScreen';
import EditProfileIndividualScreen from './components/profile/EditProfileIndividualScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import PrivacyPolicyScreen from './components/settings/PrivacyPolicyScreen';
import AboutAppScreen from './components/settings/AboutAppScreen';
import HelpCenterScreen from './components/settings/HelpCenterScreen';
import ReportProblemScreen from './components/settings/ReportProblemScreen';
import WarningsScreen from './components/settings/WarningsScreen';
import BottomNav from './components/shared/BottomNav';
import ReportPostScreen from './components/reports/ReportPostScreen';
import SubscriptionModal from './components/subscription/SubscriptionModal';
import ChatScreen from './components/chat/ChatScreen';
import ChatListScreen from './components/chat/ChatListScreen';
import ExploreScreen from './components/explore/ExploreScreen';
import FleetManagementScreen from './components/profile/FleetManagementScreen';
import AddVehicleModal from './components/profile/AddVehicleModal';
import ConfirmationModal from './components/shared/ConfirmationModal';
import LogoutConfirmationModal from './components/shared/LogoutConfirmationModal';
import ReportChatScreen from './components/chat/ReportChatScreen';
import VoiceCallScreen from './components/voicecall/VoiceCallScreen';
import VideoCallScreen from './components/videocall/VideoCallScreen';
import CommentSheet from './components/comments/CommentSheet';
import SavingIndicator from './components/shared/SavingIndicator';
import AddReviewModal from './components/profile/AddReviewModal';
import DeleteReviewModal from './components/profile/DeleteReviewModal';
import Toast from './components/shared/Toast';
import RepostModal from './components/posts/RepostModal'; // New Import
import PostDetailModal from './components/posts/PostDetailModal'; // New Import
import { chatCache } from './utils/chatCache';
import './App.css';

export type Screen = 'splash' | 'home' | 'history' | 'notifications' | 'notificationDetail' | 'search' | 'liveTracking' | 'createCargoAd' | 'createTruckAd' | 'createPost' | 'profileIndividual' | 'profileCompany' | 'editProfileCompany' | 'editProfileIndividual' | 'settings' | 'privacyPolicy' | 'aboutApp' | 'helpCenter' | 'reportProblem' | 'warnings' | 'reportPost' | 'chat' | 'chatList' | 'explore' | 'fleetManagement' | 'reportChat' | 'voiceCall' | 'videoCall' | 'signUpIndividual' | 'signUpCompany' | 'createCompanyProfile'; // Add createCompanyProfile screen
type UserType = 'individual' | 'company';
export type PublishingType = 'idle' | 'post' | 'ad';
export type ToastType = 'success' | 'error' | 'info';
export type AnimationType = 'dots' | 'truck';

export interface Notification {
    _id: string;
    type: 'like' | 'comment' | 'reply' | 'comment_like' | 'reply_like';
    sender: {
      _id: string;
      name: string;
      avatar?: string;
    };
    post: {
      _id: string;
      text: string;
    };
    comment?: {
      _id: string;
      text: string;
    };
    reply?: {
      _id: string;
      text: string;
    };
    read: boolean;
    createdAt: string;
}

export interface Vehicle {
    id: string;
    driverName: string;
    vehicleName: string;
    licensePlate: string;
    vehicleType: string;
    color: string;
    model: string;
    imageUrl: string | null;
    currentLocation: string;
    status?: 'متاح' | 'في العمل';
    startLocation?: string;
    destination?: string;
    progress?: number;
}

export interface Company {
  _id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
}

// Define a type for the profile cache entry to ensure type safety.
export interface CachedProfileData {
    profile: any;
    vehicles: Vehicle[];
    reviews: any[];
    posts?: any[];
    shipmentAds?: any[];
    emptyTruckAds?: any[];
}

// Generic confirmation modal configuration
export interface ConfirmationModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText?: string;
  onConfirm: () => void;
}

interface ToastConfig {
    id: number;
    message: string;
    type: ToastType;
}

export interface UiReply {
  id: string;
  user: { _id: string; name: string; avatar?: string };
  name: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLikedByCurrentUser: boolean;
  isSending?: boolean;
}

export interface UiComment extends UiReply {
  replyCount: number;
  replies: UiReply[];
}

// New type for audio call requests
export interface CallRequest {
  type: 'incoming' | 'outgoing';
  peerData: { _id: string; name: string; avatarUrl: string; };
  callObject?: MediaConnection;
  callLogId?: string;
}

// Fix: Add a robust helper function to convert a data URI to a Blob.
// This avoids potential TypeScript type inference issues with `fetch(dataURI)`.
function dataURIToBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}


const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('splash');
    const [exitingScreen, setExitingScreen] = useState<Screen | null>(null);
    const [navDirection, setNavDirection] = useState<'forward' | 'backward' | 'fade'>('forward');
    const [user, setUser] = useState<any>(null); // To store logged-in user data
    const [profileVersion, setProfileVersion] = useState(0);
    // Typed the profile cache state to avoid type errors when accessing its properties.
    const [profileCache, setProfileCache] = useState(() => new Map<string, CachedProfileData>());
    const [commentsCache, setCommentsCache] = useState(new Map<string, UiComment[]>());
    const [companiesCache, setCompaniesCache] = useState<Company[] | null>(null);
    const [postsVersion, setPostsVersion] = useState(0);
    const [publishingType, setPublishingType] = useState<PublishingType>('idle');
    const [deletedItemIds, setDeletedItemIds] = useState<Set<string>>(new Set());
    const [itemToEdit, setItemToEdit] = useState<any | null>(null);
    const [editOrigin, setEditOrigin] = useState<Screen>('home');
    const [unreadCount, setUnreadCount] = useState(0);
    
    // New state for notifications caching
    const [notifications, setNotifications] = useState<Notification[] | null>(null);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
    const [notificationsError, setNotificationsError] = useState<string | null>(null);
    const [notificationPostTarget, setNotificationPostTarget] = useState<any | null>(null); // For detail view
    const [postsCache, setPostsCache] = useState(new Map<string, any>());

    const [isNavVisible, setIsNavVisible] = useState(true);
    const scrollTimeoutRef = useRef<number | null>(null);

    const screensWithBottomNav: Screen[] = ['home', 'history', 'liveTracking', 'settings'];

    const handleScrollActivity = useCallback(() => {
        if (isNavVisible) {
            setIsNavVisible(false);
        }
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
            setIsNavVisible(true);
        }, 500);
    }, [isNavVisible]);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const addDeletedItemId = (itemId: string) => {
        setDeletedItemIds(prev => new Set(prev).add(itemId));
    };
    
    const setScreen = (newScreen: Screen, direction: 'forward' | 'backward' | 'fade' = 'forward') => {
        if (newScreen === activeScreen) return;

        setNavDirection(direction);
        setExitingScreen(activeScreen);
        setActiveScreen(newScreen);
        setIsNavVisible(true);

        // Clean up the exiting screen class after the animation completes
        setTimeout(() => {
            setExitingScreen(null);
        }, 400); // Should match animation duration
    };

    // --- NEW LOGIC FOR BOTTOM NAV ANIMATION ---
    const navOrder: Screen[] = ['home', 'liveTracking', 'history', 'settings'];

    const handleBottomNavClick = (newScreen: Screen) => {
        if (newScreen === activeScreen) return;
        
        const currentIndex = navOrder.indexOf(activeScreen as Screen);
        const newIndex = navOrder.indexOf(newScreen);

        // This should not happen if the bottom nav is only shown on these screens,
        // but as a fallback, just do a default forward animation.
        if (currentIndex === -1) {
            setScreen(newScreen, 'forward');
            return;
        }
    
        const direction = newIndex > currentIndex ? 'forward' : 'backward';
        setScreen(newScreen, direction);
    };
    // --- END OF NEW LOGIC ---

    const getScreenClassName = (name: Screen) => {
        const isSplash = name === 'splash';
        const baseClass = isSplash ? 'splash-container' : '';

        if (name === activeScreen) {
            return `${baseClass} page-active page-enter-${navDirection}`;
        }
        if (name === exitingScreen) {
            return `${baseClass} page-exit page-exit-${navDirection}`;
        }
        return baseClass;
    };


    const [userType, setUserType] = useState<UserType>('individual'); // Default to 'company' to showcase the new profile
    const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
    const [isAccountTypeModalOpen, setAccountTypeModalOpen] = useState(false);
    const [isCreateAdModalOpen, setCreateAdModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [reportedPost, setReportedPost] = useState<any | null>(null);
    const [reportedUser, setReportedUser] = useState<any | null>(null);
    const [chatTarget, setChatTarget] = useState<any | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [chatOrigin, setChatOrigin] = useState<Screen>('home'); // To handle back navigation from chat
    const [exploreOrigin, setExploreOrigin] = useState<Screen>('home');
    const [reportOrigin, setReportOrigin] = useState<Screen>('home');
    const [chatReportType, setChatReportType] = useState<string>('');
    
    // New state for audio call
    const [callRequest, setCallRequest] = useState<CallRequest | null>(null);
    // New state for video call
    const [videoCallRequest, setVideoCallRequest] = useState<CallRequest | null>(null);

    // State for profile navigation
    const [profileTarget, setProfileTarget] = useState<any | null>(null);
    const [profileOrigin, setProfileOrigin] = useState<Screen>('home');

    // State for multi-step company signup
    const [tempSignupData, setTempSignupData] = useState<any>(null);


    // New state for ad featuring
    const [coinBalance, setCoinBalance] = useState(0); // Set to 0 to demonstrate modal opening
    const [isAdToBeFeatured, setIsAdToBeFeatured] = useState(false);

    // New state for fleet management
    const [fleet, setFleet] = useState<Vehicle[]>([]);
    const [isAddVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
    const [savingState, setSavingState] = useState({ isSaving: false, messages: [] as string[], animationType: 'dots' as AnimationType });


    // Unified state for confirmation modals
    const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationModalConfig>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });
    
    const [isLogoutConfirmModalOpen, setLogoutConfirmModalOpen] = useState(false);

    // State for comments and replies
    const [isCommentSheetOpen, setCommentSheetOpen] = useState(false);
    const [commentPostTarget, setCommentPostTarget] = useState<any | null>(null);
    
    // State for Add Review Modal
    const [isAddReviewModalOpen, setAddReviewModalOpen] = useState(false);
    const [reviewTargetProfile, setReviewTargetProfile] = useState<any | null>(null);

    // New state for Delete Review Modal
    const [isDeleteReviewModalOpen, setDeleteReviewModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<any | null>(null);

    // State for Toast notifications
    const [toasts, setToasts] = useState<ToastConfig[]>([]);
    
    // New state for Repost Modal
    const [isRepostModalOpen, setRepostModalOpen] = useState(false);
    const [postToRepost, setPostToRepost] = useState<any | null>(null);

    // New state for Post Detail Modal
    const [postDetailTarget, setPostDetailTarget] = useState<any | null>(null);

    const modalRoot = document.getElementById('modal-root');

    const showToast = (message: string, type: ToastType = 'success') => {
        const newToast: ToastConfig = {
            id: Date.now(),
            message,
            type,
        };
        setToasts(prevToasts => [...prevToasts, newToast]);
    };

    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    // Auto-login if token exists
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token && !user) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (res.ok) {
                        const userData = await res.json();
                        setUser({
                            _id: userData._id,
                            name: userData.name,
                            email: userData.email,
                            userType: userData.userType
                        });
                        setUserType(userData.userType);
                        setScreen("home", "fade");
                        handleAuthSuccess(token, userData._id, userData.userType);
                    } else {
                        // Token invalid, remove it
                        localStorage.removeItem('authToken');
                    }
                } catch (error) {
                    console.error('Auto-login failed:', error);
                    localStorage.removeItem('authToken');
                }
            }
        };
        
        checkAuth();
    }, []);

    useEffect(() => {
        // Ping الخادم كل 10 دقائق لإبقائه مستيقظاً
        const interval = setInterval(() => {
            fetch(`${API_BASE_URL}/api/v1/ping`)
                .then(() => console.log('Server pinged successfully'))
                .catch(() => console.log('Ping failed'));
        }, 10 * 60 * 1000); // 10 دقائق

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchMyVehicles = async () => {
            const token = localStorage.getItem('authToken');
            if (!token || !user) {
                setFleet([]);
                return;
            }
            
            // فقط الشركات لديها أسطول
            if (userType !== 'company') {
                setFleet([]);
                return;
            }
    
            try {
                const res = await fetch(`${API_BASE_URL}/api/vehicles/my-vehicles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
    
                if (!res.ok) {
                    console.error("Failed to fetch fleet");
                    return;
                }
    
                const data = await res.json();
                const mappedVehicles: Vehicle[] = data.map((v: any) => ({
                    id: v._id,
                    driverName: v.driverName,
                    vehicleName: v.vehicleName,
                    licensePlate: v.licensePlate,
                    imageUrl: v.imageUrl,
                    vehicleType: v.vehicleType,
                    currentLocation: v.currentLocation,
                    color: v.vehicleColor,
                    model: v.vehicleModel,
                    status: v.status || 'متاح'
                }));
                setFleet(mappedVehicles);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            }
        };
    
        fetchMyVehicles();
    }, [user, userType]);


    const handleOpenCommentSheet = (post: any) => {
        setCommentPostTarget(post);
        setCommentSheetOpen(true);
    };

    const handleCloseCommentSheet = () => {
        setCommentSheetOpen(false);
    };
    
    const handleCommentChange = (updatedPost: any) => {
        const newCommentCount = updatedPost.comments?.length || 0;
        
        // Update the target post in state, but only the comment count
        setCommentPostTarget(prevPost => {
            if (prevPost && (prevPost.id === updatedPost._id || prevPost._id === updatedPost._id)) {
                return { ...prevPost, commentCount: newCommentCount, comments: updatedPost.comments };
            }
            return prevPost;
        });

        // Trigger a refetch/re-render on the home/profile screen
        setPostsVersion(v => v + 1);

        // Update profile cache as before
        const profileIdOfPostAuthor = updatedPost.user?._id;
        if (profileIdOfPostAuthor) {
            const cacheKeyToUpdate = (user?._id === profileIdOfPostAuthor) ? 'me' : profileIdOfPostAuthor;
            setProfileCache(prevCache => {
                const newCache = new Map(prevCache);
                const cachedData = newCache.get(cacheKeyToUpdate) as CachedProfileData | undefined;
                if (cachedData) {
                    const updateItems = (items: any[] | undefined) => 
                        items?.map(item => item._id === updatedPost._id ? { ...item, commentCount: newCommentCount, comments: updatedPost.comments } : item);
                    const updatedCachedData: CachedProfileData = {
                        ...cachedData,
                        posts: updateItems(cachedData.posts),
                        shipmentAds: updateItems(cachedData.shipmentAds),
                        emptyTruckAds: updateItems(cachedData.emptyTruckAds),
                    };
                    newCache.set(cacheKeyToUpdate, updatedCachedData);
                }
                return newCache;
            });
        }
    };


    useEffect(() => {
      const validateTokenAndSetScreen = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                // فقط احذف التوكن إذا كان غير صالح (401 أو 403)
                if (res.status === 401 || res.status === 403) {
                    console.log('Token is invalid or expired, removing...');
                    localStorage.removeItem('authToken');
                    setActiveScreen('splash');
                } else {
                    // خطأ آخر (مثل 500 أو مشكلة شبكة)، احتفظ بالتوكن
                    console.error('Error validating token, but keeping it:', res.status);
                    // حاول مرة أخرى بعد فترة
                    setTimeout(() => {
                        validateTokenAndSetScreen();
                    }, 3000);
                    return;
                }
            } else {
                const userData = await res.json();
                setUser(userData.user);
                setUserType(userData.user.userType || 'individual');
                setActiveScreen('home');
            }
          } catch(e) {
              // خطأ في الشبكة أو parsing، لا تحذف التوكن
              console.error('Network error during token validation:', e);
              // حاول مرة أخرى بعد فترة
              setTimeout(() => {
                  validateTokenAndSetScreen();
              }, 3000);
              return;
          }
        } else {
            setActiveScreen('splash');
        }
        setTimeout(() => setIsInitialLoad(false), 10);
      };

      validateTokenAndSetScreen();
    }, []);

    const handleAcceptCall = () => {
        setScreen('voiceCall');
    };

    const handleAcceptVideoCall = () => {
        setScreen('videoCall');
    };

    useEffect(() => {
        if (user?._id) {
            const peer = peerManager.initialize(user._id);

            peer.on('open', id => console.log('My peer ID is: ' + id));
            peer.on('error', err => console.error('PeerJS error:', err));

            peer.on('call', async (incomingCall) => {
                console.log('Incoming call from', incomingCall.peer, 'with metadata', incomingCall.metadata);
                // Fetch caller info
                const res = await fetch(`${API_BASE_URL}/api/v1/profile/${incomingCall.peer}`);
                if (res.ok) {
                    const peerData = await res.json();
                    const callerInfo = {
                        _id: peerData._id,
                        name: peerData.name,
                        avatarUrl: peerData.avatar || `https://ui-avatars.com/api/?name=${peerData.name.charAt(0)}`,
                    };
                    
                    const callLogId = incomingCall.metadata?.callLogId;
                    const isVideoCall = incomingCall.metadata?.type === 'video';

                    if (isVideoCall) {
                        setVideoCallRequest({ type: 'incoming', peerData: callerInfo, callObject: incomingCall, callLogId });
                        openConfirmationModal({
                            title: "مكالمة فيديو واردة",
                            message: `المستخدم ${callerInfo.name} يتصل بك.`,
                            confirmButtonText: "قبول",
                            onConfirm: () => handleAcceptVideoCall(),
                        });
                    } else { // Audio call
                        setCallRequest({ type: 'incoming', peerData: callerInfo, callObject: incomingCall, callLogId });
                        openConfirmationModal({
                            title: "مكالمة صوتية واردة",
                            message: `المستخدم ${callerInfo.name} يتصل بك.`,
                            confirmButtonText: "قبول",
                            onConfirm: () => handleAcceptCall(),
                        });
                    }
                } else {
                    console.error("Could not fetch caller info.");
                    incomingCall.close();
                }
            });

            return () => {
                peerManager.destroy();
            };
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
    
        let intervalId: number | undefined;
    
        const fetchCount = (isFromInterval = false) => {
            // When polling, don't fetch if user is looking at notifications.
            if (isFromInterval && (activeScreen === 'notifications' || activeScreen === 'notificationDetail')) {
                return;
            }
    
            const token = localStorage.getItem('authToken');
            if (!token) {
                setUnreadCount(0);
                return;
            }
    
            fetch(`${API_BASE_URL}/api/v1/users/me/notifications/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                console.error("Failed to fetch unread notification count status:", res.status);
                return null;
            })
            .then(data => {
                if (data) {
                    setUnreadCount(data.unreadCount || 0);
                }
            })
            .catch(error => {
                console.error("Failed to fetch unread notification count:", error);
            });
        };
    
        fetchCount(); // Initial fetch for login or screen change
        intervalId = window.setInterval(() => fetchCount(true), 30000); // Poll every 30 seconds
    
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [user, activeScreen]);
    
    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        setNotificationsError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setNotificationsError('الرجاء تسجيل الدخول لعرض الإشعارات.');
            setNotifications([]); // set to empty array to indicate fetch was attempted
            setIsLoadingNotifications(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/users/me/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('فشل في جلب الإشعارات.');
            }

            const data: Notification[] = await res.json();
            setNotifications(data);
        } catch (err: any) {
            setNotificationsError(err.message);
            setNotifications([]); // set to empty array to indicate fetch was attempted
        } finally {
            setIsLoadingNotifications(false);
        }
    };


    const handleLogout = () => {
        setLogoutConfirmModalOpen(true);
    };

    const handleConfirmLogout = () => {
        setLogoutConfirmModalOpen(false);
        localStorage.removeItem('authToken');
        setUser(null);
        setProfileCache(new Map());
        setCommentsCache(new Map());
        setCompaniesCache(null);
        setDeletedItemIds(new Set());
        setNotifications(null); // Reset notifications on logout
        chatCache.clearAll(); // Clear chat cache on logout
        peerManager.destroy(); // Destroy peer connection on logout
        setCallRequest(null);
        setVideoCallRequest(null);
        setScreen('splash', 'backward');
    };

    const handleSelectIndividual = () => {
        setAccountTypeModalOpen(false);
        setScreen('signUpIndividual');
    };

    const handleSelectCompany = () => {
        setAccountTypeModalOpen(false);
        setScreen('signUpCompany');
    };
    
    const handleAuthSuccess = async (token: string, userId: string, userType: UserType) => {
        // Pre-fetch and cache the user's own profile data to prevent skeleton loader on first visit.
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
    
            const isCompany = userType === 'company';
    
            const profilePromise = fetch(`${API_BASE_URL}/api/v1/profile/me`, { headers });
            
            const vehiclesPromise = isCompany 
                ? fetch(`${API_BASE_URL}/api/vehicles/my-vehicles`, { headers })
                : Promise.resolve(new Response(JSON.stringify([])));
            
            const reviewsPromise = isCompany
                ? fetch(`${API_BASE_URL}/api/reviews/${userId}`, { headers })
                : Promise.resolve(new Response(JSON.stringify({ data: [] })));
    
            const postsPromise = fetch(`${API_BASE_URL}/api/v1/posts/user/${userId}`, { headers });
    
            const shipmentAdsPromise = fetch(`${API_BASE_URL}/api/v1/shipmentads/user/${userId}`, { headers });
    
            const emptyTruckAdsPromise = fetch(`${API_BASE_URL}/api/v1/emptytruckads/user/${userId}`, { headers });
    
            const [
                profileRes, 
                vehiclesRes, 
                reviewsRes,
                postsRes,
                shipmentAdsRes,
                emptyTruckAdsRes
            ] = await Promise.all([
                profilePromise,
                vehiclesPromise,
                reviewsPromise,
                // FIX: Corrected a typo where postsRes was used before declaration.
                postsPromise,
                shipmentAdsPromise,
                emptyTruckAdsPromise
            ]);
    
            if (!profileRes.ok) {
                 const errorText = await profileRes.text();
                 throw new Error(`Failed to pre-fetch profile data: ${profileRes.status} ${errorText}`);
            }
    
            const newProfileData = await profileRes.json();
            
            // Enrich the main user state with full profile details (like avatar)
            setUser(prevUser => ({ ...prevUser, ...newProfileData }));

            const newVehiclesData = vehiclesRes.ok ? await vehiclesRes.json() : [];
            const newReviewsData = reviewsRes.ok ? (await reviewsRes.json()).data || [] : [];
            const newPostsData = postsRes.ok ? await postsRes.json() : [];
            const newShipmentAdsData = shipmentAdsRes.ok ? await shipmentAdsRes.json() : [];
            const newEmptyTruckAdsData = emptyTruckAdsRes.ok ? await emptyTruckAdsRes.json() : [];
    
            const mappedVehicles: Vehicle[] = newVehiclesData.map((v: any) => ({
                id: v._id,
                driverName: v.driverName,
                vehicleName: v.vehicleName,
                licensePlate: v.licensePlate,
                imageUrl: v.imageUrl,
                vehicleType: v.vehicleType,
                currentLocation: v.currentLocation,
                color: v.vehicleColor,
                model: v.vehicleModel,
                status: v.status || 'متاح'
            }));
    
            const dataToCache: CachedProfileData = {
                profile: newProfileData,
                vehicles: mappedVehicles,
                reviews: newReviewsData,
                posts: newPostsData,
                shipmentAds: newShipmentAdsData,
                emptyTruckAds: newEmptyTruckAdsData,
            };
            
            setProfileCache(prev => new Map(prev).set('me', dataToCache));
    
        } catch (error) {
            console.error("Error pre-fetching profile data:", error);
        }
    };
    
    const handleLoginSuccess = (data: any) => {
        localStorage.setItem('authToken', data.token);
        setUser({
            _id: data._id,
            name: data.name,
            email: data.email,
            userType: data.userType
        });
        setUserType(data.userType);
        setScreen("home", "fade");
        handleAuthSuccess(data.token, data._id, data.userType);
    };
    
    const handleSignupSuccess = (data: any) => {
        localStorage.setItem('authToken', data.token);
        const newUser = {
            _id: data._id,
            name: data.name,
            email: data.email,
            userType: data.userType
        };
        setUser(newUser);
        setUserType(data.userType);

        // For individuals, sign up is one step.
        if (data.userType === 'individual') {
            setScreen('home', 'fade');
            handleAuthSuccess(data.token, data._id, data.userType);
        }
    };

    const handleProceedToProfile = (signupData: any) => {
        setTempSignupData(signupData);
        setScreen('createCompanyProfile');
    };

    const _performProfileUpdate = async (profilePayload: any, token: string) => {
        let finalPayload = { ...profilePayload };
    
        const uploadFile = async (base64Data: string | null) => {
            if (!base64Data || !base64Data.startsWith('data:')) return base64Data; // Return if not a new base64 image
            // Fix: Use a robust dataURI to Blob conversion instead of fetch.
            const blob = dataURIToBlob(base64Data);
            const formData = new FormData();
            formData.append('file', blob);
            const res = await fetch(`${API_BASE_URL}/api/upload/single`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('فشل تحميل الملف.');
            const data = await res.json();
            return data.filePath;
        };
    
        const uploadMultipleFiles = async (base64Array: string[]) => {
            const newImagesBase64 = base64Array.filter(img => img.startsWith('data:'));
            const existingImageUrls = base64Array.filter(img => !img.startsWith('data:'));

            if (newImagesBase64.length === 0) return existingImageUrls;

            const fleetFormData = new FormData();
            // Fix: Use a robust dataURI to Blob conversion instead of fetch.
            const blobs = newImagesBase64.map(dataURIToBlob);
            blobs.forEach(blob => fleetFormData.append('files', blob));

            const fleetRes = await fetch(`${API_BASE_URL}/api/upload/multiple`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fleetFormData,
            });
            if (!fleetRes.ok) throw new Error('فشل في تحميل صور الأسطول.');
            const fleetUploadData = await fleetRes.json();
            return [...existingImageUrls, ...(fleetUploadData.filePaths || [])];
        };

        const [avatarUrl, coverImageUrl, fleetImageUrls, licenseImageUrls] = await Promise.all([
            uploadFile(finalPayload.avatar),
            uploadFile(finalPayload.coverImage),
            uploadMultipleFiles(finalPayload.fleetImages || []),
            uploadMultipleFiles(finalPayload.licenseImages || []),
        ]);
        
        finalPayload = { 
            ...finalPayload, 
            avatar: avatarUrl, 
            coverImage: coverImageUrl, 
            fleetImages: fleetImageUrls,
            licenseImages: licenseImageUrls
        };

        const res = await fetch(`${API_BASE_URL}/api/v1/profile/me`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(finalPayload),
        });
    
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'فشل في تحديث الملف الشخصي.');
        }
    
        const updatedProfileData = await res.json();
    
        // Update cache to prevent skeleton loader on profile screen.
        setProfileCache(prevCache => {
            const newCache = new Map(prevCache);
            const cachedData = newCache.get('me') as CachedProfileData | undefined;
            if (cachedData) {
                const updatedCachedData: CachedProfileData = {
                    ...cachedData,
                    profile: {
                        ...cachedData.profile,
                        ...updatedProfileData,
                    },
                };
                newCache.set('me', updatedCachedData);
            } else {
                // If cache doesn't exist for some reason, delete to trigger full refetch
                newCache.delete('me');
            }
            return newCache;
        });
        
        // Also update the main user object with potentially new name/avatar
         setUser(prevUser => ({ ...prevUser, ...updatedProfileData }));
    };

    const handleFinalizeCompanySignup = async (profileData: any) => {
        if (!tempSignupData) {
            showToast('بيانات التسجيل غير موجودة.', 'error');
            setScreen('signUpCompany', 'backward');
            return;
        }

        setSavingState({ isSaving: true, messages: ["جاري إنشاء حسابك...", "لحظة من فضلك..."], animationType: 'truck' });

        try {
            // Step 1: Register user
            const registerRes = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...tempSignupData, userType: 'company' }),
            });

            const registerData = await registerRes.json();
            if (!registerRes.ok) throw new Error(registerData.message || 'فشل إنشاء الحساب');

            // Step 2: Set auth state
            const { token, user: newUserData } = registerData;
            localStorage.setItem('authToken', token);
            setUser({ _id: newUserData._id, name: newUserData.name, email: newUserData.email, userType: newUserData.userType });
            setUserType(newUserData.userType);
            setTempSignupData(null);

            // Step 3: Update profile with details from the second screen
            setSavingState({ isSaving: true, messages: ["جاري إعداد ملفك الشخصي...", "تحميل الصور...", "لمسة أخيرة..."], animationType: 'truck' });
            await _performProfileUpdate(profileData, token);

            // Step 4: Final success and navigation
            showToast('تم إنشاء حسابك وملفك الشخصي بنجاح!', 'success');
            setScreen('home', 'fade');
            
            // Pre-fetch data after successful creation
            handleAuthSuccess(token, newUserData._id, newUserData.userType);

        } catch (err: any) {
            showToast(err.message || 'حدث خطأ أثناء إكمال التسجيل.', 'error');
            localStorage.removeItem('authToken');
            setUser(null);
            setScreen('signUpCompany', 'backward');
        } finally {
            setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
        }
    };


    const handleOpenNotifications = () => {
        // 1. Optimistically update UI state immediately if there are unread notifications.
        if (unreadCount > 0) {
            setUnreadCount(0); // Reset badge count.
            setNotifications(prev => 
                prev ? prev.map(n => ({ ...n, read: true })) : null
            );
        }
    
        // 2. Fire-and-forget backend update.
        const markAllAsRead = async () => {
            const token = localStorage.getItem('authToken');
            // Only make the call if there were unread notifications to mark.
            if (!token || unreadCount === 0) return; 
    
            try {
                // Assuming a new endpoint for this functionality.
                await fetch(`${API_BASE_URL}/api/v1/users/me/notifications/mark-all-as-read`, {
                    method: 'POST', // Using POST as it changes the state of multiple resources.
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to mark all notifications as read on backend:", error);
                // Optional: Revert optimistic updates if the call fails. For this UX, it's better not to.
            }
        };
        markAllAsRead(); // Call the async function without awaiting.
    
        // 3. Fetch notifications only if they haven't been fetched yet.
        if (notifications === null) {
            fetchNotifications();
        }
    
        // 4. Navigate to the screen.
        setScreen('notifications');
    };

    const handleOpenNotificationDetail = (post: any) => {
        setNotificationPostTarget(post);
        setScreen('notificationDetail');
    };

    const handleOpenSearch = () => {
        setScreen('search');
    };
    
    const handleOpenMyProfile = (origin: Screen) => {
        setProfileTarget(null); // 'null' indicates it's the logged-in user's profile
        setProfileOrigin(origin);
        if (userType === 'individual') {
            setScreen('profileIndividual');
        } else {
            setScreen('profileCompany');
        }
    };

    const handleOpenOtherProfile = (user: any, origin: Screen) => {
        setProfileTarget(user);
        setProfileOrigin(origin);
        if (user.userType === 'individual') {
            setScreen('profileIndividual');
        } else {
            setScreen('profileCompany');
        }
    };

    const handleNavigateBackFromProfile = () => {
        setScreen(profileOrigin, 'backward');
    };

    const handleOpenEditPost = (post: any, origin: Screen) => {
        setItemToEdit(post);
        setEditOrigin(origin);
    
        const postType = post.type || (post.from ? 'shipmentAd' : (post.currentLocation ? 'emptyTruckAd' : 'general'));
    
        if (postType === 'general' || post.isRepost) {
            setScreen('createPost');
        } else if (postType === 'shipmentAd') {
            setScreen('createCargoAd');
        } else if (postType === 'emptyTruckAd') {
            setScreen('createTruckAd');
        }
    };


    const handleOpenSettings = () => {
        setScreen('settings');
    };
    
    const handleNavigateToHome = (direction: 'forward' | 'backward' = 'forward') => {
        setScreen('home', direction);
        if (direction === 'backward') {
            setIsAdToBeFeatured(false); // Reset featured status when navigating away from ad creation
        }
    };

    const handleNavigateToHistory = () => {
        setScreen('history');
    };
    
    const handleNavigateToLiveTracking = () => {
        setScreen('liveTracking');
    };

    const handleNavigateBackFromCreate = () => {
        const origin = itemToEdit ? editOrigin : 'home';
        setItemToEdit(null);
        setScreen(origin, 'backward');
    };

    const handleNavigateToProfileCompany = (refresh: boolean = false) => {
        if (refresh) {
            setProfileVersion(v => v + 1);
        }
        setScreen('profileCompany', 'backward');
    }

    const handleSelectCargoAd = () => {
        setCreateAdModalOpen(false);
        setScreen('createCargoAd');
    };

    const handleSelectTruckAd = () => {
        setCreateAdModalOpen(false);
        setScreen('createTruckAd');
    };

    const handleSelectCreatePost = () => {
        setCreateAdModalOpen(false);
        setScreen('createPost');
    };
    
    const handlePublishPost = async (postData: { text: string; mediaFile: File | null; }) => {
        const isEditMode = !!itemToEdit;
        if (isEditMode) {
            setSavingState({ isSaving: true, messages: ['جاري حفظ التعديلات...'], animationType: 'dots' });
        } else {
            setPublishingType('post');
            handleNavigateBackFromCreate();
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('يجب تسجيل الدخول.', 'error');
            if (isEditMode) setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
            else setPublishingType('idle');
            return;
        }

        try {
            let mediaPayload = [];
            if (postData.mediaFile) {
                const formData = new FormData();
                formData.append('file', postData.mediaFile);
                
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/single`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error('فشل في تحميل الوسائط.');

                // Fix: Corrected a typo from `res` to `uploadRes` when parsing the JSON response from the media upload endpoint.
                const uploadData = await uploadRes.json();
                mediaPayload.push({
                    url: uploadData.filePath,
                    type: postData.mediaFile.type.startsWith('image') ? 'image' : 'video',
                });
            } else if (isEditMode && itemToEdit?.media?.length > 0) {
                mediaPayload = itemToEdit.media;
            }

            const finalPostPayload = { text: postData.text, media: mediaPayload };
            const endpoint = isEditMode ? `${API_BASE_URL}/api/v1/posts/${itemToEdit._id}` : `${API_BASE_URL}/api/v1/posts`;
            const method = isEditMode ? 'PUT' : 'POST';

            const postRes = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(finalPostPayload),
            });
            if (!postRes.ok) {
                const errorData = await postRes.json();
                throw new Error(errorData.message || `فشل في ${isEditMode ? 'تحديث' : 'إنشاء'} المنشور.`);
            }
            
            setProfileCache(prev => { const newCache = new Map(prev); newCache.delete('me'); newCache.delete(user?._id); return newCache; });
            setPostsVersion(v => v + 1);
            if (isEditMode) {
                showToast('تم تحديث المنشور بنجاح!', 'success');
                handleNavigateBackFromCreate();
            }

        } catch (error: any) {
            showToast(error.message, 'error');
            if (!isEditMode) setPublishingType('idle');
        } finally {
            if (isEditMode) {
                setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
                setItemToEdit(null);
            }
        }
    };

    const handlePublishCargoAd = async (adData: { pickupLocation: string; deliveryLocation: string; pickupDate: string; truckType: string; description: string; mediaFile: File | null; }) => {
        const isEditMode = !!itemToEdit;
        if (isEditMode) {
            setSavingState({ isSaving: true, messages: ['جاري حفظ التعديلات...'], animationType: 'dots' });
        } else {
            setPublishingType('ad');
            handleNavigateBackFromCreate();
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('يجب تسجيل الدخول.', 'error');
            if (isEditMode) setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
            else setPublishingType('idle');
            return;
        }

        try {
            let mediaPayload = [];
            if (adData.mediaFile) {
                const formData = new FormData();
                formData.append('file', adData.mediaFile);
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/single`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error('فشل في تحميل الوسائط.');
                const uploadData = await uploadRes.json();
                mediaPayload.push({ url: uploadData.filePath, type: adData.mediaFile.type.startsWith('image') ? 'image' : 'video' });
            } else if (isEditMode && itemToEdit?.media?.length > 0) {
                mediaPayload = itemToEdit.media;
            }


            const finalAdPayload = { ...adData, media: mediaPayload };
            const endpoint = isEditMode ? `${API_BASE_URL}/api/v1/shipmentads/${itemToEdit._id}` : `${API_BASE_URL}/api/v1/shipmentads`;
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(finalAdPayload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `فشل في ${isEditMode ? 'تحديث' : 'إنشاء'} الإعلان.`);
            }
            
            setProfileCache(prev => { const newCache = new Map(prev); newCache.delete('me'); newCache.delete(user?._id); return newCache; });
            setPostsVersion(v => v + 1);
            if (isEditMode) {
                showToast('تم تحديث الإعلان بنجاح!', 'success');
                handleNavigateBackFromCreate();
            }
        } catch (error: any) {
            showToast(error.message, 'error');
            if (!isEditMode) setPublishingType('idle');
        } finally {
             if (isEditMode) {
                setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
                setItemToEdit(null);
            }
        }
    };
    
    const handlePublishEmptyTruckAd = async (adData: { currentLocation: string; preferredDestination: string; availabilityDate: string; truckType: string; additionalNotes: string; mediaFile: File | null; }) => {
        const isEditMode = !!itemToEdit;
        if (isEditMode) {
            setSavingState({ isSaving: true, messages: ['جاري حفظ التعديلات...'], animationType: 'dots' });
        } else {
            setPublishingType('ad');
            handleNavigateBackFromCreate();
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('يجب تسجيل الدخول.', 'error');
            if (isEditMode) setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
            else setPublishingType('idle');
            return;
        }

        try {
            let mediaPayload = [];
            if (adData.mediaFile) {
                const formData = new FormData();
                formData.append('file', adData.mediaFile);
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/single`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error('فشل في تحميل الوسائط.');
                const uploadData = await uploadRes.json();
                mediaPayload.push({ url: uploadData.filePath, type: adData.mediaFile.type.startsWith('image') ? 'image' : 'video' });
            } else if (isEditMode && itemToEdit?.media?.length > 0) {
                mediaPayload = itemToEdit.media;
            }

            const finalAdPayload = { ...adData, media: mediaPayload };
            const endpoint = isEditMode ? `${API_BASE_URL}/api/v1/emptytruckads/${itemToEdit._id}` : `${API_BASE_URL}/api/v1/emptytruckads`;
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(finalAdPayload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `فشل في ${isEditMode ? 'تحديث' : 'إنشاء'} الإعلان.`);
            }
            
            setProfileCache(prev => { const newCache = new Map(prev); newCache.delete('me'); newCache.delete(user?._id); return newCache; });
            setPostsVersion(v => v + 1);
            if (isEditMode) {
                showToast('تم تحديث الإعلان بنجاح!', 'success');
                handleNavigateBackFromCreate();
            }
        } catch (error: any) {
            showToast(error.message, 'error');
            if (!isEditMode) setPublishingType('idle');
        } finally {
             if (isEditMode) {
                setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
                setItemToEdit(null);
            }
        }
    };

    const onPublishingComplete = useCallback(() => {
        setPublishingType('idle');
    }, []);

    const handleOpenEditProfile = () => {
        setScreen('editProfileCompany');
    }

    const handleOpenEditProfileIndividual = () => {
        setScreen('editProfileIndividual');
    };

    const handleOpenPrivacyPolicy = () => setScreen('privacyPolicy');
    const handleOpenAboutApp = () => setScreen('aboutApp');
    const handleOpenHelpCenter = () => setScreen('helpCenter');
    const handleOpenReportProblem = () => setScreen('reportProblem');
    const handleOpenWarnings = () => setScreen('warnings');

    const handleNavigateBackToSettings = () => {
        setScreen('settings', 'backward');
    };

    const handleOpenReportPost = (post: any, origin: Screen = 'home') => {
        setCommentSheetOpen(false); // Close comment sheet if open
        setReportOrigin(origin);
        setReportedPost(post);
        setReportedUser(null);
        setScreen('reportPost');
    };
    
    const handleOpenReportProfile = (user: any, origin: Screen = 'home') => {
        setCommentSheetOpen(false); // Close comment sheet if open
        setReportOrigin(origin);
        setReportedUser(user);
        setReportedPost(null);
        setScreen('reportPost'); // Use the 'reportPost' screen for both
    };

    const handleNavigateBackFromReport = () => {
        setScreen(reportOrigin, 'backward');
    };

    const handleOpenSubscriptionModal = () => setSubscriptionModalOpen(true);

    const handleOpenChat = (target: any, origin: Screen) => {
        const token = localStorage.getItem('authToken');
        const isConversationObject = target && target.participant;
    
        if (!token || (!target._id && !isConversationObject)) {
            showToast('لا يمكن بدء المحادثة.', 'error');
            return;
        }
    
        if (isConversationObject) {
            // We already have the conversation object, open instantly
            setChatTarget(target.participant);
            setConversationId(target._id);
            setChatOrigin(origin);
            setScreen('chat');
        } else {
            // This is a new chat with a user object. Navigate instantly.
            // The ChatScreen will be responsible for creating the conversation.
            const targetUser = target;
            setChatTarget(targetUser);
            setConversationId(null); // Signal to ChatScreen to create/get conversation
            setChatOrigin(origin);
            setScreen('chat');
        }
    };
    
    const handleNavigateBackFromChat = () => {
        setScreen(chatOrigin, 'backward');
    };
    
    const handleOpenReportFromChat = (reportType: string) => {
        setChatReportType(reportType);
        setReportOrigin('chat'); // The origin is always the chat screen
        setScreen('reportChat');
    };

    const handleOpenVoiceCall = async (user: { name: string; avatarUrl: string; _id: string; }) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('You must be logged in to make calls.', 'error');
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/call-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ receiverId: user._id, callType: 'audio', status: 'connecting' })
            });
            if (!res.ok) throw new Error('Failed to create call log.');
            const newCallLog = await res.json();
            setCallRequest({ type: 'outgoing', peerData: user, callLogId: newCallLog._id });
            setScreen('voiceCall');
        } catch (error) {
            console.error("Failed to initiate call:", error);
            showToast('Failed to start call. Please try again.', 'error');
        }
    };
    
    const handleEndCall = () => {
        setCallRequest(null);
        // Determine where to navigate back to
        const origin = activeScreen === 'voiceCall' ? chatOrigin : activeScreen;
        setScreen(origin, 'backward');
    };
    
    const handleOpenVideoCall = async (user: { _id: string; name: string; avatarUrl: string; }) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('You must be logged in to make calls.', 'error');
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/call-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ receiverId: user._id, callType: 'video', status: 'connecting' })
            });
            if (!res.ok) throw new Error('Failed to create call log.');
            const newCallLog = await res.json();
            setVideoCallRequest({ type: 'outgoing', peerData: user, callLogId: newCallLog._id });
            setScreen('videoCall');
        } catch (error) {
            console.error("Failed to initiate video call:", error);
            showToast('Failed to start video call. Please try again.', 'error');
        }
    };

    const handleEndVideoCall = () => {
        setVideoCallRequest(null);
        setScreen(chatOrigin, 'backward'); // Return to wherever the call was initiated from (profile or chat)
    };

    const handleOpenChatList = () => {
        setScreen('chatList');
    };
    
    const handleOpenNewChat = () => {
        setExploreOrigin('chatList');
        setScreen('explore');
    };

    const handleOpenExplore = () => {
        setExploreOrigin('home');
        setScreen('explore');
    };

    const handleOpenChatFromExplore = (user: { name: string; avatarUrl: string; }) => {
        // When starting a chat from the "explore companies" screen, the origin for backing out
        // should be the explore screen itself.
        handleOpenChat(user, 'explore');
    };

    const handleOpenFleetManagement = () => {
        setScreen('fleetManagement');
    };
    
    const handleOpenAddVehicle = () => {
        setVehicleToEdit(null);
        setAddVehicleModalOpen(true);
    };

    const handleOpenEditVehicle = (vehicle: Vehicle) => {
        setVehicleToEdit(vehicle);
        setAddVehicleModalOpen(true);
    };
    
    const openConfirmationModal = (config: Omit<ConfirmationModalConfig, 'isOpen'>) => {
        setConfirmationConfig({ ...config, isOpen: true });
    };

    const closeConfirmationModal = (confirmed = false) => {
        if (!confirmed) {
            const token = localStorage.getItem('authToken');
            // If we're closing a call modal without confirming, it's a rejection.
            if (confirmationConfig.title.includes("مكالمة صوتية")) {
                if (callRequest?.callLogId && token) {
                    fetch(`${API_BASE_URL}/api/v1/call-logs/${callRequest.callLogId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ status: 'declined' })
                    }).catch(e => console.error("Failed to update call log:", e));
                }
                callRequest?.callObject?.close();
                setCallRequest(null);
            }
            if (confirmationConfig.title.includes("مكالمة فيديو")) {
                if (videoCallRequest?.callLogId && token) {
                   fetch(`${API_BASE_URL}/api/v1/call-logs/${videoCallRequest.callLogId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ status: 'declined' })
                  }).catch(e => console.error("Failed to update call log:", e));
                }
                videoCallRequest?.callObject?.close();
                setVideoCallRequest(null);
            }
        }
        setConfirmationConfig(prev => ({ ...prev, isOpen: false, title: '', message: '', onConfirm: () => {} }));
    };

    const handleDeleteVehicle = (vehicleId: string) => {
        openConfirmationModal({
            title: "تأكيد الحذف",
            message: "هل أنت متأكد من رغبتك في حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء.",
            confirmButtonText: "نعم، احذف",
            onConfirm: async () => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    showToast('يجب تسجيل الدخول أولاً', 'error');
                    return;
                }
        
                let deleteSuccess = false;
        
                setSavingState({ 
                    isSaving: true, 
                    messages: ["جاري الحذف...", "تحديث بيانات الأسطول", "لحظة من فضلك..."],
                    animationType: 'dots'
                });
        
                try {
                    const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
        
                    if (!res.ok) {
                        throw new Error('فشل في حذف المركبة.');
                    }
                    
                    setFleet(prevFleet => prevFleet.filter(v => v.id !== vehicleId));
        
                    setProfileCache(prevCache => {
                        const newCache = new Map(prevCache);
                        const myProfileCache = newCache.get('me');
                        if (myProfileCache) {
                            const typedMyProfileCache = myProfileCache as CachedProfileData;
                            const updatedVehicles = typedMyProfileCache.vehicles.filter((v: Vehicle) => v.id !== vehicleId);
                            const updatedProfileData = { ...typedMyProfileCache, vehicles: updatedVehicles };
                            newCache.set('me', updatedProfileData);
                        }
                        return newCache;
                    });
                    
                    deleteSuccess = true;
                    showToast('تم حذف المركبة بنجاح.');
                    
                } catch(e: any) {
                    console.error("Error deleting vehicle:", e);
                    showToast(e.message || 'حدث خطأ ما.', 'error');
                } finally {
                    if (deleteSuccess) {
                        handleNavigateToProfileCompany(false);
                        setTimeout(() => {
                            setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
                        }, 500);
                    } else {
                        setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
                    }
                }
            }
        });
    };
    
    const handleSaveVehicle = async (vehicleData: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('يجب تسجيل الدخول أولاً', 'error');
            return;
        }
    
        // Fix: Define isEditMode before vehicleToEdit is reset.
        const isEditMode = !!vehicleToEdit;
        setAddVehicleModalOpen(false);
        setSavingState({
            isSaving: true,
            messages: ["جاري الحفظ...", "نعزز أسطولك الآن", "نقوي بنيتك"],
            animationType: 'dots'
        });
    
        try {
            let finalVehicleData = { ...vehicleData };
    
            // Handle image upload if a new image (base64) is present
            if (finalVehicleData.imageUrl && finalVehicleData.imageUrl.startsWith('data:')) {
                // Fix: Use a robust dataURI to Blob conversion instead of fetch.
                const blob = dataURIToBlob(finalVehicleData.imageUrl);
                const formData = new FormData();
                formData.append('file', blob);
    
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/single`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
    
                if (!uploadRes.ok) throw new Error('فشل في تحميل صورة المركبة.');
    
                const uploadData = await uploadRes.json();
                finalVehicleData.imageUrl = uploadData.filePath; // Replace base64 with Cloudinary URL
            }
    
            let finalVehicle: Vehicle;
    
            if (vehicleToEdit) {
                const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleToEdit.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(finalVehicleData),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'فشل في تحديث المركبة');
                }
                const savedData = await res.json();
                finalVehicle = {
                    id: savedData._id,
                    status: savedData.status || 'متاح',
                    driverName: savedData.driverName,
                    vehicleName: savedData.vehicleName,
                    licensePlate: savedData.licensePlate,
                    imageUrl: savedData.imageUrl,
                    vehicleType: savedData.vehicleType,
                    currentLocation: savedData.currentLocation,
                    color: savedData.vehicleColor,
                    model: savedData.vehicleModel,
                };
                setFleet(prevFleet => prevFleet.map(v => (v.id === vehicleToEdit.id ? finalVehicle : v)));
            } else {
                const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(finalVehicleData),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'فشل في إضافة المركبة');
                }
                const savedVehicle = await res.json();
                finalVehicle = {
                    id: savedVehicle._id,
                    status: savedVehicle.status || 'متاح',
                    driverName: savedVehicle.driverName,
                    vehicleName: savedVehicle.vehicleName,
                    licensePlate: savedVehicle.licensePlate,
                    imageUrl: savedVehicle.imageUrl,
                    vehicleType: savedVehicle.vehicleType,
                    currentLocation: savedVehicle.currentLocation,
                    color: savedVehicle.vehicleColor,
                    model: savedVehicle.vehicleModel,
                };
                setFleet(prevFleet => [...prevFleet, finalVehicle]);
            }
    
            // Manually update profile cache to prevent skeleton loader for a seamless experience
            setProfileCache(prevCache => {
                const newCache = new Map(prevCache);
                const myProfileCache = newCache.get('me');
                if (myProfileCache) {
                    const typedMyProfileCache = myProfileCache as CachedProfileData;
                    const updatedVehicles = vehicleToEdit
                        ? typedMyProfileCache.vehicles.map((v: Vehicle) => (v.id === vehicleToEdit.id ? finalVehicle : v))
                        : [...typedMyProfileCache.vehicles, finalVehicle];
    
                    const updatedProfileData = { ...typedMyProfileCache, vehicles: updatedVehicles };
                    newCache.set('me', updatedProfileData);
                }
                return newCache;
            });
    
            setVehicleToEdit(null);
            setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
            showToast(isEditMode ? 'تم تحديث المركبة بنجاح.' : 'تمت إضافة المركبة بنجاح.');
            handleNavigateToProfileCompany(false); // Navigate WITHOUT triggering a refresh
    
        } catch (error: any) {
            console.error('Error saving vehicle:', error);
            showToast(error.message || 'حدث خطأ أثناء حفظ المركبة', 'error');
            setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
        }
    };
    

    const handleUpdateProfile = async (profilePayload: any) => {
        console.log('🚀 بدء عملية تحديث الملف الشخصي');
        console.log('📊 البيانات المستلمة:', profilePayload);
    
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ لا يوجد توكن مصادقة');
            showToast('يجب تسجيل الدخول أولاً', 'error');
            return;
        }
    
        setSavingState({
            isSaving: true,
            messages: ["يرجى الانتظار...", "نقوم بتحديث هويتك الرقمية", "نجعل ملفك أكثر جاذبية"],
            animationType: 'dots'
        });
    
        let updateSuccess = false;
        
        try {
            console.log('⏳ جاري رفع الصور وتحديث البيانات...');
            await _performProfileUpdate(profilePayload, token);
            console.log('✅ تم التحديث بنجاح');
            updateSuccess = true;
        } catch (error: any) {
            console.error('❌ خطأ في تحديث الملف الشخصي:', error);
            console.error('تفاصيل الخطأ:', error.message);
            showToast(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي', 'error');
        } finally {
            if (updateSuccess) {
                showToast('تم تحديث الملف الشخصي بنجاح.');
                handleNavigateToProfileCompany(true); // Navigate back and trigger refresh
            }
             // Delay to allow screen transition before removing saving indicator
            setTimeout(() => {
                setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
            }, 500);
        }
    };
    
    const handleUpdateIndividualProfile = async (profilePayload: any) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('يجب تسجيل الدخول أولاً', 'error');
            return;
        }

        setSavingState({ isSaving: true, messages: ["جاري حفظ التغييرات..."], animationType: 'dots' });

        let updateSuccess = false;
        let finalPayload = { ...profilePayload };

        try {
            if (finalPayload.avatar && finalPayload.avatar.startsWith('data:')) {
                // Fix: Use a robust dataURI to Blob conversion instead of fetch.
                const blob = dataURIToBlob(finalPayload.avatar);
                const formData = new FormData();
                formData.append('file', blob);
                const res = await fetch(`${API_BASE_URL}/api/upload/single`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!res.ok) throw new Error('فشل تحميل صورة الملف الشخصي.');
                const data = await res.json();
                finalPayload.avatar = data.filePath;
            }

            const res = await fetch(`${API_BASE_URL}/api/v1/profile/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(finalPayload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'فشل في تحديث الملف الشخصي.');
            }
            
            const updatedProfileData = await res.json();

            setProfileCache(prevCache => {
                const newCache = new Map(prevCache);
                const myProfileCache = newCache.get('me');
                if (myProfileCache) {
                    const typedMyProfileCache = myProfileCache as CachedProfileData;
                    const newCachedData = {
                        ...typedMyProfileCache,
                        profile: { ...typedMyProfileCache.profile, ...updatedProfileData },
                    };
                    newCache.set('me', newCachedData);
                } else {
                    newCache.set('me', { profile: updatedProfileData, vehicles: [], reviews: [], posts: [], shipmentAds: [], emptyTruckAds: [] });
                }
                return newCache;
            });
            
            updateSuccess = true;

        } catch (error: any) {
            console.error('Error updating individual profile:', error);
            showToast(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي', 'error');
        } finally {
            if (updateSuccess) {
                showToast('تم تحديث الملف الشخصي بنجاح.');
                setScreen('profileIndividual', 'backward');
                setTimeout(() => {
                    setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
                }, 500); // Delay to allow screen transition
            } else {
                setSavingState({ isSaving: false, messages: [], animationType: 'dots' });
            }
        }
    };


    const handleCloseVehicleModal = () => {
        setAddVehicleModalOpen(false);
        setVehicleToEdit(null);
    };

    const handleOpenAddReviewModal = (profile: any) => {
        setReviewTargetProfile(profile);
        setAddReviewModalOpen(true);
    };

    const handleCloseAddReviewModal = () => {
        setAddReviewModalOpen(false);
        setReviewTargetProfile(null);
    };
    
    // New handler for Delete Review Modal
    const handleOpenDeleteReviewModal = (review: any) => {
        setReviewToDelete(review);
        setDeleteReviewModalOpen(true);
    };

    const handleCloseDeleteReviewModal = () => {
        setDeleteReviewModalOpen(false);
        setReviewToDelete(null);
    };

    const handleReviewSubmit = async (reviewData: { rating: number; comment: string; media: string | null }) => {
        handleCloseAddReviewModal();

        if (!reviewTargetProfile || !user) {
            showToast("خطأ: لا يمكن تحديد المستخدم أو الملف الشخصي.", 'error');
            return;
        }

        const profileId = reviewTargetProfile._id;
        const tempId = `temp_${Date.now()}`;

        const tempReview = {
            _id: tempId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            media: reviewData.media ? [reviewData.media] : [], // API expects an array
            author: {
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
            },
            profile: profileId,
            createdAt: new Date().toISOString(),
        };

        // Optimistically update cache
        setProfileCache(prev => {
            const newCache = new Map(prev);
            const cachedData = newCache.get(profileId) as CachedProfileData | undefined;
            if (cachedData) {
                const updatedReviews = [tempReview, ...cachedData.reviews];
                const newReviewCount = (cachedData.profile.reviewCount || 0) + 1;
                const totalRating = (cachedData.profile.rating || 0) * (cachedData.profile.reviewCount || 0);
                const newAverageRating = (totalRating + tempReview.rating) / newReviewCount;
                const updatedProfile = {
                    ...cachedData.profile,
                    reviewCount: newReviewCount,
                    rating: newAverageRating,
                };
                newCache.set(profileId, { ...cachedData, profile: updatedProfile, reviews: updatedReviews });
            }
            return newCache;
        });

        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('يجب تسجيل الدخول لإضافة تقييم.', 'error');
            // Note: In a real app, you'd add logic here to revert the optimistic update.
            return;
        }

        try {
            let finalMediaUrls: string[] = [];
            if (reviewData.media) {
                // Fix: Use a robust dataURI to Blob conversion instead of fetch.
                const blob = dataURIToBlob(reviewData.media);
                const formData = new FormData();
                formData.append('file', blob);

                const uploadRes = await fetch(`${API_BASE_URL}/api/upload/single`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error('فشل تحميل صورة التقييم.');
                const uploadData = await uploadRes.json();
                finalMediaUrls.push(uploadData.filePath);
            }

            const response = await fetch(`${API_BASE_URL}/api/reviews/${profileId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    media: finalMediaUrls,
                }),
            });

            const finalReview = await response.json();
            if (!response.ok) {
                throw new Error(finalReview.message || 'فشل إرسال التقييم.');
            }

            // On success, replace temp review with the final one from the server
            setProfileCache(prev => {
                const newCache = new Map(prev);
                const cachedData = newCache.get(profileId) as CachedProfileData | undefined;
                if (cachedData) {
                    const finalReviews = cachedData.reviews.map(r => (r._id === tempId ? finalReview : r));
                    newCache.set(profileId, { ...cachedData, reviews: finalReviews });
                }
                return newCache;
            });
            showToast('تم نشر تقييمك بنجاح.');

        } catch (err: any) {
            showToast(`فشل نشر التقييم: ${err.message}`, 'error');
            // On failure, revert the optimistic update
            setProfileCache(prev => {
                const newCache = new Map(prev);
                const cachedData = newCache.get(profileId) as CachedProfileData | undefined;
                if (cachedData) {
                    const revertedReviews = cachedData.reviews.filter(r => r._id !== tempId);
                    const newReviewCount = Math.max(0, (cachedData.profile.reviewCount || 1) - 1);
                    const totalRating = (cachedData.profile.rating || 0) * (cachedData.profile.reviewCount || 1);
                    const newAverageRating = newReviewCount > 0 ? (totalRating - tempReview.rating) / newReviewCount : 0;
                    const revertedProfile = {
                        ...cachedData.profile,
                        reviewCount: newReviewCount,
                        rating: newAverageRating,
                    };
                    newCache.set(profileId, { ...cachedData, profile: revertedProfile, reviews: revertedReviews });
                }
                return newCache;
            });
        }
    };
    
    // Repost Handlers
    const handleOpenRepostModal = (post: any) => {
        setPostToRepost(post);
        setRepostModalOpen(true);
    };

    const handleCloseRepostModal = () => {
        setPostToRepost(null);
        setRepostModalOpen(false);
    };

    const handleConfirmRepost = async (repostText: string, postBeingReposted: any) => {
        if (!postBeingReposted) return;

        const token = localStorage.getItem('authToken');
        if (!token) {
            showToast('يجب تسجيل الدخول لإعادة النشر.', 'error');
            return;
        }

        const getApiPostType = (post: any) => {
            const type = post.type;
            if (type === 'general') return 'post';
            if (type) return type;
            if (post.pickupLocation) return 'shipmentAd';
            if (post.currentLocation) return 'emptyTruckAd';
            return 'post'; // Default for general posts
        };

        const payload = {
            text: repostText,
            originalPostId: postBeingReposted.id || postBeingReposted._id,
            originalPostType: getApiPostType(postBeingReposted)
        };
        
        handleCloseRepostModal();

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/posts/repost`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'فشل في إعادة النشر.');
            }
            
            showToast('تمت إعادة النشر بنجاح!', 'success');
            setPostsVersion(v => v + 1);
            
             // Invalidate own profile cache to reflect the new post
            setProfileCache(prevCache => {
                const newCache = new Map(prevCache);
                newCache.delete('me');
                return newCache;
            });

        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // New handlers for PostDetailModal
    const handleOpenPostDetail = (post: any) => {
        setPostDetailTarget(post);
    };
    const handleClosePostDetail = () => {
        setPostDetailTarget(null);
    };


    const renderModals = () => (
        <>
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
            {savingState.isSaving && <SavingIndicator messages={savingState.messages} animationType={savingState.animationType} />}
            <ForgotPasswordModal
                isOpen={isForgotPasswordModalOpen}
                onClose={() => setForgotPasswordModalOpen(false)}
            />
            <AccountTypeSelectionModal
                isOpen={isAccountTypeModalOpen}
                onClose={() => setAccountTypeModalOpen(false)}
                onSelectIndividual={handleSelectIndividual}
                onSelectCompany={handleSelectCompany}
            />
             <CreateAdModal
                isOpen={isCreateAdModalOpen}
                onClose={() => setCreateAdModalOpen(false)}
                onSelectCargo={handleSelectCargoAd}
                onSelectTruck={handleSelectTruckAd}
                onSelectPost={handleSelectCreatePost}
            />
            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setSubscriptionModalOpen(false)}
            />
            <AddVehicleModal
                isOpen={isAddVehicleModalOpen}
                onClose={handleCloseVehicleModal}
                onSaveVehicle={handleSaveVehicle}
                vehicleToEdit={vehicleToEdit}
            />
            <ConfirmationModal
                isOpen={confirmationConfig.isOpen}
                onClose={() => closeConfirmationModal()}
                onConfirm={() => {
                    confirmationConfig.onConfirm();
                    closeConfirmationModal(true);
                }}
                title={confirmationConfig.title}
                message={confirmationConfig.message}
                confirmButtonText={confirmationConfig.confirmButtonText}
            />
             <LogoutConfirmationModal 
                isOpen={isLogoutConfirmModalOpen}
                onClose={() => setLogoutConfirmModalOpen(false)}
                onConfirm={handleConfirmLogout}
            />
            
            <CommentSheet 
                isOpen={isCommentSheetOpen}
                onClose={handleCloseCommentSheet}
                post={commentPostTarget}
                user={user}
                onShowToast={showToast}
                onCommentChange={handleCommentChange}
                commentsCache={commentsCache}
                setCommentsCache={setCommentsCache}
                onOpenReportProfile={(userToReport) => handleOpenReportProfile(userToReport, 'home')}
                onOpenConfirmationModal={openConfirmationModal}
            />
            
            <AddReviewModal 
                isOpen={isAddReviewModalOpen} 
                onClose={handleCloseAddReviewModal}
                onReviewSubmit={handleReviewSubmit}
            />
            <DeleteReviewModal
                isOpen={isDeleteReviewModalOpen}
                onClose={handleCloseDeleteReviewModal}
                review={reviewToDelete}
                onShowToast={showToast}
            />
            <RepostModal
                isOpen={isRepostModalOpen}
                onClose={handleCloseRepostModal}
                post={postToRepost}
                user={user}
                onConfirm={(text) => handleConfirmRepost(text, postToRepost)}
            />
             <PostDetailModal
                isOpen={!!postDetailTarget}
                onClose={handleClosePostDetail}
                post={postDetailTarget}
                user={user}
                onOpenReportPost={(post) => handleOpenReportPost(post, 'profileIndividual')}
                onOpenOtherProfile={(user) => handleOpenOtherProfile(user, 'profileIndividual')}
                onOpenChat={(user) => handleOpenChat(user, 'profileIndividual')}
                onOpenCommentSheet={(post) => { handleClosePostDetail(); handleOpenCommentSheet(post); }}
                onOpenRepostModal={(post) => { handleClosePostDetail(); handleOpenRepostModal(post); }}
                onOpenEditPost={(post) => { handleClosePostDetail(); handleOpenEditPost(post, 'profileIndividual'); }}
                onOpenConfirmationModal={openConfirmationModal}
                addDeletedItemId={addDeletedItemId}
                onShowToast={showToast}
            />
        </>
    );

    return (
        <>
            <div className={`app-wrapper ${isInitialLoad ? 'initial-load' : ''}`}>
                <SplashScreen
                    className={getScreenClassName('splash')}
                    onOpenAccountTypeModal={() => setAccountTypeModalOpen(true)}
                    onLoginSuccess={handleLoginSuccess}
                    onOpenForgotPasswordModal={() => setForgotPasswordModalOpen(true)}
                />
                <HomeScreen
                    className={getScreenClassName('home')}
                    onOpenNotifications={handleOpenNotifications}
                    onOpenSearch={handleOpenSearch}
                    onOpenExplore={handleOpenExplore}
                    onOpenCreateAdModal={() => setCreateAdModalOpen(true)}
                    onOpenReportPost={(post) => handleOpenReportPost(post, 'home')}
                    onOpenMyProfile={() => handleOpenMyProfile('home')}
                    onOpenOtherProfile={(user) => handleOpenOtherProfile(user, 'home')}
                    onOpenChat={(user) => handleOpenChat(user, 'home')}
                    onOpenChatList={handleOpenChatList}
                    onOpenCommentSheet={handleOpenCommentSheet}
                    onOpenRepostModal={handleOpenRepostModal}
                    onOpenEditPost={handleOpenEditPost}
                    companiesCache={companiesCache}
                    setCompaniesCache={setCompaniesCache}
                    user={user}
                    postsVersion={postsVersion}
                    publishingType={publishingType}
                    onPublishingComplete={onPublishingComplete}
                    onOpenConfirmationModal={openConfirmationModal}
                    deletedItemIds={deletedItemIds}
                    addDeletedItemId={addDeletedItemId}
                    onShowToast={showToast}
                    onScrollActivity={handleScrollActivity}
                    unreadCount={unreadCount}
                />
                <HistoryScreen
                    className={getScreenClassName('history')}
                    onScrollActivity={handleScrollActivity}
                    user={user}
                />
                <NotificationsScreen
                    className={getScreenClassName('notifications')}
                    onNavigateBack={() => setScreen('home', 'backward')}
                    notifications={notifications}
                    isLoading={isLoadingNotifications}
                    error={notificationsError}
                    setNotifications={setNotifications}
                    onOpenNotificationDetail={handleOpenNotificationDetail}
                />
                <NotificationDetailScreen
                    className={getScreenClassName('notificationDetail')}
                    onNavigateBack={() => setScreen('notifications', 'backward')}
                    post={notificationPostTarget}
                    user={user}
                    onShowToast={showToast}
                    onCommentChange={handleCommentChange}
                    commentsCache={commentsCache}
                    setCommentsCache={setCommentsCache}
                    onOpenReportProfile={(user) => handleOpenReportProfile(user, 'notificationDetail')}
                    onOpenConfirmationModal={openConfirmationModal}
                    onOpenOtherProfile={(user) => handleOpenOtherProfile(user, 'notificationDetail')}
                    onOpenRepostModal={handleOpenRepostModal}
                    onOpenEditPost={handleOpenEditPost}
                    addDeletedItemId={addDeletedItemId}
                    postsCache={postsCache}
                    setPostsCache={setPostsCache}
                />
                <SearchScreen
                    className={getScreenClassName('search')}
                    onNavigateBack={() => setScreen('home', 'backward')}
                    onOpenProfile={(user) => handleOpenOtherProfile(user, 'search')}
                    onOpenPost={handleOpenPostDetail}
                    onOpenChat={(user) => handleOpenChat(user, 'search')}
                />
                <LiveTrackingScreen
                    className={getScreenClassName('liveTracking')}
                    onScrollActivity={handleScrollActivity}
                />
                <SignUpIndividualScreen
                    className={getScreenClassName('signUpIndividual')}
                    onNavigateBack={() => setScreen('splash', 'backward')}
                    onSignupSuccess={handleSignupSuccess}
                />
                <SignUpCompanyScreen
                    className={getScreenClassName('signUpCompany')}
                    onNavigateBack={() => setScreen('splash', 'backward')}
                    onProceedToProfile={handleProceedToProfile}
                />
                <CreateCompanyProfileScreen
                    className={getScreenClassName('createCompanyProfile')}
                    onNavigateBack={() => setScreen('signUpCompany', 'backward')}
                    onFinalizeSignup={handleFinalizeCompanySignup}
                />
                <CreateCargoAdScreen
                    className={getScreenClassName('createCargoAd')}
                    onNavigateBack={handleNavigateBackFromCreate}
                    onPublishAd={handlePublishCargoAd}
                    coinBalance={coinBalance}
                    isAdToBeFeatured={isAdToBeFeatured}
                    setIsAdToBeFeatured={setIsAdToBeFeatured}
                    onOpenSubscriptionModal={handleOpenSubscriptionModal}
                    itemToEdit={itemToEdit}
                />
                <CreateTruckAdScreen
                    className={getScreenClassName('createTruckAd')}
                    onNavigateBack={handleNavigateBackFromCreate}
                    onPublishAd={handlePublishEmptyTruckAd}
                    coinBalance={coinBalance}
                    isAdToBeFeatured={isAdToBeFeatured}
                    setIsAdToBeFeatured={setIsAdToBeFeatured}
                    onOpenSubscriptionModal={handleOpenSubscriptionModal}
                    itemToEdit={itemToEdit}
                />
                <CreatePostScreen
                    className={getScreenClassName('createPost')}
                    onNavigateBack={handleNavigateBackFromCreate}
                    onPostCreated={handlePublishPost}
                    user={user}
                    itemToEdit={itemToEdit}
                />
                <ProfileIndividualScreen
                    className={getScreenClassName('profileIndividual')}
                    onNavigateBack={handleNavigateBackFromProfile}
                    onLogout={handleLogout}
                    onOpenEditProfile={handleOpenEditProfileIndividual}
                    profileCache={profileCache}
                    setProfileCache={setProfileCache}
                    profileData={profileTarget}
                    onOpenChat={(target) => handleOpenChat(target, 'profileIndividual')}
                    onOpenVoiceCall={() => handleOpenVoiceCall(profileTarget)}
                    onOpenVideoCall={() => handleOpenVideoCall(profileTarget)}
                    onOpenReportProfile={(target) => handleOpenReportProfile(target, 'profileIndividual')}
                    profileOrigin={profileOrigin}
                    onShowToast={showToast}
                    onOpenConfirmationModal={openConfirmationModal}
                    onOpenPostDetail={handleOpenPostDetail}
                />
                <ProfileCompanyScreen
                    className={getScreenClassName('profileCompany')}
                    onNavigateBack={handleNavigateBackFromProfile}
                    onEditProfile={handleOpenEditProfile}
                    onLogout={handleLogout}
                    onOpenReportPost={(post) => handleOpenReportPost(post, 'profileCompany')}
                    onOpenReportProfile={(user) => handleOpenReportProfile(user, 'profileCompany')}
                    onOpenChat={(target) => handleOpenChat(target, 'profileCompany')}
                    onOpenVoiceCall={() => handleOpenVoiceCall(profileTarget)}
                    onOpenVideoCall={() => handleOpenVideoCall(profileTarget)}
                    onOpenFleetManagement={handleOpenFleetManagement}
                    onOpenAddReviewModal={handleOpenAddReviewModal}
                    onOpenDeleteReviewModal={handleOpenDeleteReviewModal}
                    profileData={profileTarget}
                    profileOrigin={profileOrigin}
                    profileVersion={profileVersion}
                    profileCache={profileCache}
                    setProfileCache={setProfileCache}
                    onOpenCommentSheet={handleOpenCommentSheet}
                    onOpenRepostModal={handleOpenRepostModal}
                    onOpenEditPost={handleOpenEditPost}
                    onOpenConfirmationModal={openConfirmationModal}
                    addDeletedItemId={addDeletedItemId}
                    onShowToast={showToast}
                    user={user}
                />
                <EditProfileCompanyScreen
                    className={getScreenClassName('editProfileCompany')}
                    onNavigateBack={handleNavigateToProfileCompany}
                    onSave={handleUpdateProfile}
                    profileCache={profileCache}
                    setSavingState={setSavingState as any}
                />
                <EditProfileIndividualScreen
                    className={getScreenClassName('editProfileIndividual')}
                    onNavigateBack={() => setScreen('profileIndividual', 'backward')}
                    onSave={handleUpdateIndividualProfile}
                    profileCache={profileCache}
                />
                <SettingsScreen
                    className={getScreenClassName('settings')}
                    onNavigateBack={() => handleNavigateToHome('backward')}
                    onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                    onOpenAboutApp={handleOpenAboutApp}
                    onOpenHelpCenter={handleOpenHelpCenter}
                    onOpenReportProblem={handleOpenReportProblem}
                    onOpenWarnings={handleOpenWarnings}
                    onOpenSubscriptionModal={handleOpenSubscriptionModal}
                    onScrollActivity={handleScrollActivity}
                    user={user}
                />
                <PrivacyPolicyScreen
                    className={getScreenClassName('privacyPolicy')}
                    onNavigateBack={handleNavigateBackToSettings}
                />
                <AboutAppScreen
                    className={getScreenClassName('aboutApp')}
                    onNavigateBack={handleNavigateBackToSettings}
                />
                <HelpCenterScreen
                    className={getScreenClassName('helpCenter')}
                    onNavigateBack={handleNavigateBackToSettings}
                />
                <ReportProblemScreen
                    className={getScreenClassName('reportProblem')}
                    onNavigateBack={handleNavigateBackToSettings}
                />
                <WarningsScreen
                    className={getScreenClassName('warnings')}
                    onNavigateBack={handleNavigateBackToSettings}
                />
                <ReportPostScreen
                    className={getScreenClassName('reportPost')}
                    onNavigateBack={handleNavigateBackFromReport}
                    post={reportedPost}
                    user={reportedUser}
                    onShowToast={showToast}
                />
                <ChatScreen
                    className={getScreenClassName('chat')}
                    onNavigateBack={handleNavigateBackFromChat}
                    user={chatTarget}
                    onOpenProfile={(user) => handleOpenOtherProfile(user, 'chat')}
                    onOpenReportFromChat={handleOpenReportFromChat}
                    onOpenVoiceCall={() => handleOpenVoiceCall(chatTarget)}
                    onOpenVideoCall={() => handleOpenVideoCall(chatTarget)}
                    chatOrigin={chatOrigin}
                    conversationId={conversationId}
                    setConversationId={setConversationId}
                />
                <ChatListScreen
                    className={getScreenClassName('chatList')}
                    onNavigateBack={() => setScreen('home', 'backward')}
                    onOpenNewChat={handleOpenNewChat}
                    onOpenChat={(conv) => handleOpenChat(conv, 'chatList')}
                    user={user}
                />
                <ExploreScreen
                    className={getScreenClassName('explore')}
                    onNavigateBack={() => setScreen(exploreOrigin, 'backward')}
                    onOpenChat={handleOpenChatFromExplore}
                    onOpenProfile={(user) => handleOpenOtherProfile(user, 'explore')}
                />
                <FleetManagementScreen
                    className={getScreenClassName('fleetManagement')}
                    onNavigateBack={() => setScreen('profileCompany', 'backward')}
                    fleet={fleet}
                    onOpenAddVehicleModal={handleOpenAddVehicle}
                    onEditVehicle={handleOpenEditVehicle}
                    onDeleteVehicle={handleDeleteVehicle}
                />
                <ReportChatScreen
                    className={getScreenClassName('reportChat')}
                    onNavigateBack={() => setScreen('chat', 'backward')}
                    reportType={chatReportType}
                    user={chatTarget}
                />
                <VoiceCallScreen
                    className={getScreenClassName('voiceCall')}
                    callRequest={callRequest}
                    onEndCall={handleEndCall}
                />
                <VideoCallScreen
                    className={getScreenClassName('videoCall')}
                    callRequest={videoCallRequest}
                    onEndCall={handleEndVideoCall}
                />
            </div>
            {modalRoot && createPortal(renderModals(), modalRoot)}
            {screensWithBottomNav.includes(activeScreen) && (
                <BottomNav
                    className={isNavVisible ? 'visible' : 'hidden'}
                    activeScreen={activeScreen}
                    onNavigateHome={() => handleBottomNavClick('home')}
                    onNavigateHistory={() => handleBottomNavClick('history')}
                    onNavigateLiveTracking={() => handleBottomNavClick('liveTracking')}
                    onOpenSettings={() => handleBottomNavClick('settings')}
                />
            )}
        </>
    );
};

export default App;
