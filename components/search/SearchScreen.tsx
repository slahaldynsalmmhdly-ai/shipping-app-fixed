import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import './SearchScreen.css';
import type { Screen } from '../../App';

// --- TYPE DEFINITIONS ---
interface Company {
  _id: string;
  name: string;
  companyName: string;
  avatar?: string;
  coverImage?: string;
  description?: string;
  city?: string;
  rating?: number;
  reviewCount?: number;
  truckCount?: number;
  type: "company";
}

interface Post {
  _id: string;
  user: { _id: string; name: string; avatar?: string; };
  text: string;
  media: Array<{url: string; type: string}>;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  type: "post";
}

interface Vehicle {
  _id: string;
  user: { _id: string; name: string; avatar?: string; };
  vehicleName: string;
  vehicleType: string;
  driverName: string;
  licensePlate: string;
  currentLocation: string;
  status: string;
  imageUrl?: string;
  type: "vehicle";
}

interface ShipmentAd {
  _id: string;
  user: { _id: string; name: string; avatar?: string; };
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  truckType: string;
  description?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  type: "shipment";
}

interface EmptyTruckAd {
  _id: string;
  user: { _id: string; name: string; avatar?: string; };
  currentLocation: string;
  preferredDestination?: string;
  availabilityDate: string;
  truckType: string;
  additionalNotes?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  type: "emptyTruck";
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalPages?: number;
  hasMore?: boolean;
}

interface SearchResult {
  companies: Company[];
  posts: Post[];
  vehicles: Vehicle[];
  shipmentAds: ShipmentAd[];
  emptyTruckAds: EmptyTruckAd[];
  totalResults: number;
  pagination: Pagination;
}

// --- UTILITY & HELPER COMPONENTS ---

const getFullImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:image') || url.startsWith('http')) return url;
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
    return 'الآن';
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const starPath = "m5.825 21 2.325-7.6-5.6-5.45 7.625-1.125L12 0l2.825 6.825 7.625 1.125-5.6 5.45L19.175 21 12 17.275Z";
    return (
        <div className="star-rating-search">
            {[...Array(fullStars)].map((_, i) => (<svg key={`f-${i}`} viewBox="0 0 24 24"><path d={starPath} /></svg>))}
            {halfStar && <svg key="h" viewBox="0 0 24 24"><path d={starPath} /></svg>}
            {[...Array(emptyStars)].map((_, i) => (<svg key={`e-${i}`} viewBox="0 0 24 24"><path d={starPath} /></svg>))}
        </div>
    );
};

const HighlightedText: React.FC<{ text?: string; highlight?: string }> = ({ text = '', highlight = '' }) => {
    if (!highlight.trim()) return <>{text}</>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? <strong key={i} className="highlight">{part}</strong> : <span key={i}>{part}</span>
            )}
        </>
    );
};

// --- SKELETON COMPONENTS ---

const CompanyListItemSkeleton = () => (
    <div className="search-list-item company-list-item skeleton">
        <div className="skeleton-avatar item-avatar"></div>
        <div className="item-content">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line short"></div>
        </div>
    </div>
);


const PostSkeleton = () => (
    <div className="search-card post-card skeleton">
        <div className="post-header-sk">
            <div className="skeleton-avatar small"></div>
            <div className="skeleton-line" style={{ width: '40%' }}></div>
        </div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-image post-media"></div>
    </div>
);

const VehicleSkeleton = () => (
    <div className="search-card vehicle-card skeleton">
        <div className="vehicle-card-main-info">
            <div className="skeleton skeleton-img-small"></div>
            <div className="vehicle-card-header-info">
                <div className="skeleton skeleton-line title"></div>
                <div className="skeleton skeleton-line short"></div>
            </div>
        </div>
        <div className="vehicle-card-details">
            <div className="skeleton skeleton-line long"></div>
            <div className="skeleton skeleton-line long"></div>
            <div className="skeleton skeleton-line long"></div>
        </div>
    </div>
);

const AdSkeleton = () => (
    <div className="search-card ad-card skeleton">
        <div className="post-header-sk">
            <div className="skeleton-avatar small"></div>
            <div className="skeleton-line" style={{ width: '40%' }}></div>
        </div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line long"></div>
    </div>
);

const SearchSkeleton: React.FC<{ category: string }> = ({ category }) => {
    const skeletons = {
        all: (
            <>
                <h2 className="skeleton-section-title"><div className="skeleton-line" style={{ width: 120, height: 20 }}></div></h2>
                <div className="results-list">{[...Array(2)].map((_, i) => <CompanyListItemSkeleton key={i} />)}</div>
                <h2 className="skeleton-section-title"><div className="skeleton-line" style={{ width: 120, height: 20 }}></div></h2>
                <div className="results-list"><PostSkeleton /></div>
            </>
        ),
        companies: <div className="results-list">{[...Array(4)].map((_, i) => <CompanyListItemSkeleton key={i} />)}</div>,
        posts: <div className="results-list">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>,
        vehicles: <div className="results-list full-width-results">{[...Array(4)].map((_, i) => <VehicleSkeleton key={i} />)}</div>,
        shipments: <div className="results-list">{[...Array(3)].map((_, i) => <AdSkeleton key={i} />)}</div>,
        emptyTrucks: <div className="results-list">{[...Array(3)].map((_, i) => <AdSkeleton key={i} />)}</div>,
    };
    return skeletons[category as keyof typeof skeletons] || skeletons.all;
};

// --- CARD COMPONENTS ---

const CompanyListItem: React.FC<{ item: Company, query: string, onOpenProfile?: (user:any) => void, onOpenChat?: (user:any) => void }> = ({ item, query, onOpenProfile, onOpenChat }) => (
    <div className="search-list-item company-list-item" onClick={() => onOpenProfile && onOpenProfile(item)}>
        <img className="item-avatar" src={getFullImageUrl(item.avatar) || `https://ui-avatars.com/api/?name=${(item.name || '?').charAt(0)}`} alt={item.name} />
        <div className="item-content">
            <div className="item-header">
                <h3 className="item-name"><HighlightedText text={item.name} highlight={query} /></h3>
                {item.city && <span className="item-meta-info"><HighlightedText text={item.city} highlight={query} /></span>}
            </div>
            { (item.rating || 0) > 0 && 
                <div className="item-meta">
                    <StarRating rating={item.rating || 0} />
                    <span>({item.reviewCount || 0} مراجعة)</span>
                </div>
            }
        </div>
        {onOpenChat && (
            <button className="item-chat-btn" onClick={(e) => { e.stopPropagation(); onOpenChat(item); }} aria-label={`مراسلة ${item.name}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        )}
    </div>
);


const PostCard: React.FC<{ item: Post, query: string, onOpenPost?: (post:any) => void, onOpenChat?: (user:any) => void }> = ({ item, query, onOpenPost, onOpenChat }) => (
    <div className="search-card post-card" onClick={() => onOpenPost && onOpenPost(item)}>
        <div className="post-card-header">
            <div className="post-card-author-info">
                <img src={getFullImageUrl(item.user.avatar)} alt={item.user.name} />
                <div>
                    <h4>{item.user.name}</h4>
                    <span>{timeAgo(item.createdAt)}</span>
                </div>
            </div>
            {onOpenChat && (
                <button className="card-chat-btn-icon" onClick={(e) => { e.stopPropagation(); onOpenChat(item.user); }} aria-label={`مراسلة ${item.user.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            )}
        </div>
        <p><HighlightedText text={item.text} highlight={query} /></p>
        {item.media?.[0] && <img className="post-card-media" src={getFullImageUrl(item.media[0].url)} alt="media"/>}
        <div className="post-card-footer">
            <span>{item.likesCount} إعجاب</span>
            <span>{item.commentsCount} تعليق</span>
        </div>
    </div>
);

const VehicleCard: React.FC<{ item: Vehicle, query: string, onOpenProfile?: (user:any) => void, onOpenChat?: (user:any) => void }> = ({ item, query, onOpenProfile, onOpenChat }) => (
    <div className="search-card vehicle-card" onClick={() => onOpenProfile && onOpenProfile(item.user)}>
        <div className="vehicle-card-main-info">
            <img 
                src={getFullImageUrl(item.imageUrl) || `https://ui-avatars.com/api/?name=${(item.vehicleName || 'T').charAt(0)}&background=bdc3c7&color=fff&size=128`} 
                className="vehicle-card-img-small" 
                alt={item.vehicleName} 
            />
            <div className="vehicle-card-header-info">
                <h3><HighlightedText text={item.vehicleName} highlight={query} /></h3>
                <p><HighlightedText text={item.vehicleType} highlight={query} /></p>
            </div>
            <span className={`status-badge ${item.status === 'متاح' ? 'available' : 'busy'}`}>{item.status}</span>
             {onOpenChat && (
                <button className="card-chat-btn-icon" onClick={(e) => { e.stopPropagation(); onOpenChat(item.user); }} aria-label={`مراسلة ${item.user.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            )}
        </div>
        <div className="vehicle-card-details">
            <div className="vehicle-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" /></svg>
                <label>السائق:</label>
                <span><HighlightedText text={item.driverName} highlight={query} /></span>
            </div>
            <div className="vehicle-detail-item">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.25 6.25a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zM6.25 10a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zM6.25 13.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" /><path d="M3.5 3A1.5 1.5 0 002 4.5v11A1.5 1.5 0 003.5 17h13a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0016.5 3h-13zM1.5 4.5a3 3 0 013-3h11a3 3 0 013 3v11a3 3 0 01-3 3h-11a3 3 0 01-3-3v-11z" /></svg>
                <label>اللوحة:</label>
                <span><HighlightedText text={item.licensePlate} highlight={query} /></span>
            </div>
             <div className="vehicle-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.223.654-.369.254-.145.546-.32.84-.523.295-.203.618-.45.945-.737.327-.287.666-.612.988-.962a10 10 0 002.33-4.475 8 8 0 10-16 0 10 10 0 002.33 4.475c.322.35.66.675.988.962.327.287.65.534.945.737.294.203.586.378.84.523.254-.146.468.269.654.369a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /></svg>
                <label>الموقع:</label>
                <span><HighlightedText text={item.currentLocation} highlight={query} /></span>
            </div>
        </div>
    </div>
);

const AdCard: React.FC<{ item: ShipmentAd | EmptyTruckAd, query: string, onOpenPost?: (post:any) => void, onOpenChat?: (user:any) => void }> = ({ item, query, onOpenPost, onOpenChat }) => (
    <div className="search-card ad-card" onClick={() => onOpenPost && onOpenPost(item)}>
        <div className="post-card-header">
            <div className="post-card-author-info">
                <img src={getFullImageUrl(item.user.avatar)} alt={item.user.name} />
                <div>
                    <h4>{item.user.name}</h4>
                    <span>{timeAgo(item.createdAt)}</span>
                </div>
            </div>
             {onOpenChat && (
                <button className="card-chat-btn-icon" onClick={(e) => { e.stopPropagation(); onOpenChat(item.user); }} aria-label={`مراسلة ${item.user.name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            )}
        </div>
        <div className="ad-card-route">
            <HighlightedText text={'pickupLocation' in item ? item.pickupLocation : item.currentLocation} highlight={query} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            <HighlightedText text={'deliveryLocation' in item ? item.deliveryLocation : item.preferredDestination} highlight={query} />
        </div>
        <p className="ad-description"><HighlightedText text={'description' in item ? item.description : item.additionalNotes} highlight={query} /></p>
        <div className="post-card-footer">
            <span>{item.likesCount} إعجاب</span>
            <span>{item.commentsCount} تعليق</span>
        </div>
    </div>
);


// --- MAIN SCREEN & LOGIC ---

interface SearchScreenProps {
  className?: string;
  onNavigateBack: () => void;
  onOpenProfile?: (user: any) => void;
  onOpenPost?: (post: any) => void;
  onOpenChat?: (user: any) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ className, onNavigateBack, onOpenProfile, onOpenPost, onOpenChat }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted.current) setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);
  
  const fetchResults = useCallback(async (fetchPage: number) => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    if (fetchPage === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/search?query=${encodeURIComponent(debouncedQuery)}&category=${category}&page=${fetchPage}&limit=10`
      );
      if (!response.ok) throw new Error('فشل البحث. يرجى المحاولة مرة أخرى.');
      const data = await response.json();
      if (!isMounted.current) return;

      setResults(prev => {
        if (fetchPage === 1) return data.results;
        return {
          ...data.results,
          companies: [...(prev?.companies || []), ...data.results.companies],
          posts: [...(prev?.posts || []), ...data.results.posts],
          vehicles: [...(prev?.vehicles || []), ...data.results.vehicles],
          shipmentAds: [...(prev?.shipmentAds || []), ...data.results.shipmentAds],
          emptyTruckAds: [...(prev?.emptyTruckAds || []), ...data.results.emptyTruckAds],
        };
      });
    } catch (err: any) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [debouncedQuery, category]);


  useEffect(() => {
    setPage(1);
    fetchResults(1);
  }, [debouncedQuery, category, fetchResults]);

  const handleLoadMore = () => {
    const newPage = page + 1;
    setPage(newPage);
    fetchResults(newPage);
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const categories = {
    all: 'الكل',
    companies: 'الشركات',
    posts: 'المنشورات',
    vehicles: 'الأساطيل',
    shipments: 'إعلانات الشحن',
    emptyTrucks: 'الشاحنات الفارغة'
  };

  return (
    <div className={`app-container search-container ${className || ''}`}>
      <header className="search-header">
        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="search" placeholder="ابحث عن شحنة، شاحنة، أو شركة..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          {query && <button className="clear-btn" onClick={() => setQuery('')}>&times;</button>}
        </div>
        <button onClick={onNavigateBack} className="cancel-btn">إلغاء</button>
      </header>
      <div className="category-tabs">
        {Object.entries(categories).map(([key, value]) => (
            <button key={key} className={`tab-btn ${category === key ? 'active' : ''}`} onClick={() => handleCategoryChange(key)}>{value}</button>
        ))}
      </div>
      <main className="app-content search-content">
        {!debouncedQuery.trim() && !isLoading && !results && !error && (
            <div className="feedback-view initial-prompt">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h3>ابحث في شحن سريع</h3>
                <p>اعثر على شركات، منشورات، شحنات، والمزيد.</p>
            </div>
        )}
        {isLoading && page === 1 && <SearchSkeleton category={category} />}
        {error && <div className="feedback-view error"><p>{error}</p><button onClick={() => fetchResults(1)}>حاول مرة أخرى</button></div>}
        {!isLoading && debouncedQuery.trim() && results && results.totalResults === 0 && (
          <div className="feedback-view">
            <h3>لم نجد أي نتائج لـ "{debouncedQuery}"</h3>
            <p>جرب البحث بكلمات مختلفة أو تصفح الفئات.</p>
          </div>
        )}
        {!isLoading && !error && results && results.totalResults > 0 && (
          <div className="search-results-container">
            {category === 'all' ? (
                <>
                    {results.companies.length > 0 && (
                        <section className="results-section">
                            <header><h2>الشركات ({results.companies.length})</h2><button onClick={() => setCategory('companies')}>عرض المزيد</button></header>
                            <div className="results-list">{results.companies.slice(0, 4).map(item => <CompanyListItem key={item._id} item={item} query={debouncedQuery} onOpenProfile={onOpenProfile} onOpenChat={onOpenChat} />)}</div>
                        </section>
                    )}
                    {results.posts.length > 0 && (
                       <section className="results-section">
                            <header><h2>المنشورات ({results.posts.length})</h2><button onClick={() => setCategory('posts')}>عرض المزيد</button></header>
                            <div className="results-list full-width-results">{results.posts.slice(0, 3).map(item => <PostCard key={item._id} item={item} query={debouncedQuery} onOpenPost={onOpenPost} onOpenChat={onOpenChat} />)}</div>
                        </section>
                    )}
                    {results.vehicles.length > 0 && (
                        <section className="results-section">
                            <header><h2>الأساطيل ({results.vehicles.length})</h2><button onClick={() => setCategory('vehicles')}>عرض المزيد</button></header>
                            <div className="results-list full-width-results">{results.vehicles.slice(0, 2).map(item => <VehicleCard key={item._id} item={item} query={debouncedQuery} onOpenProfile={onOpenProfile} onOpenChat={onOpenChat} />)}</div>
                        </section>
                    )}
                     {results.shipmentAds.length > 0 && (
                       <section className="results-section">
                            <header><h2>إعلانات الشحن ({results.shipmentAds.length})</h2><button onClick={() => setCategory('shipments')}>عرض المزيد</button></header>
                            <div className="results-list full-width-results">{results.shipmentAds.slice(0, 3).map(item => <AdCard key={item._id} item={item} query={debouncedQuery} onOpenPost={onOpenPost} onOpenChat={onOpenChat} />)}</div>
                        </section>
                    )}
                    {results.emptyTruckAds.length > 0 && (
                       <section className="results-section">
                            <header><h2>شاحنات فارغة ({results.emptyTruckAds.length})</h2><button onClick={() => setCategory('emptyTrucks')}>عرض المزيد</button></header>
                            <div className="results-list full-width-results">{results.emptyTruckAds.slice(0, 3).map(item => <AdCard key={item._id} item={item} query={debouncedQuery} onOpenPost={onOpenPost} onOpenChat={onOpenChat} />)}</div>
                        </section>
                    )}
                </>
            ) : (
                <>
                    {category === 'companies' && <div className="results-list">{results.companies.map(item => <CompanyListItem key={item._id} item={item} query={debouncedQuery} onOpenProfile={onOpenProfile} onOpenChat={onOpenChat} />)}</div>}
                    {category === 'posts' && <div className="results-list full-width-results">{results.posts.map(item => <PostCard key={item._id} item={item} query={debouncedQuery} onOpenPost={onOpenPost} onOpenChat={onOpenChat} />)}</div>}
                    {category === 'vehicles' && <div className="results-list full-width-results">{results.vehicles.map(item => <VehicleCard key={item._id} item={item} query={debouncedQuery} onOpenProfile={onOpenProfile} onOpenChat={onOpenChat} />)}</div>}
                    {category === 'shipments' && <div className="results-list full-width-results">{results.shipmentAds.map(item => <AdCard key={item._id} item={item} query={debouncedQuery} onOpenPost={onOpenPost} onOpenChat={onOpenChat} />)}</div>}
                    {category === 'emptyTrucks' && <div className="results-list full-width-results">{results.emptyTruckAds.map(item => <AdCard key={item._id} item={item} query={debouncedQuery} onOpenPost={onOpenPost} onOpenChat={onOpenChat} />)}</div>}
                    
                    {results.pagination?.hasMore && !isLoadingMore && (
                        <button className="load-more-btn" onClick={handleLoadMore}>تحميل المزيد</button>
                    )}
                    {isLoadingMore && <SearchSkeleton category={category} />}
                </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchScreen;