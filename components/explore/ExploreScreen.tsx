import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import './ExploreScreen.css';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('data:image') || url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const starPath = "m5.825 21 2.325-7.6-5.6-5.45 7.625-1.125L12 0l2.825 6.825 7.625 1.125-5.6 5.45L19.175 21 12 17.275Z";
    const emptyStarColor = "var(--border-color)";
    return (
        <div className="explore-star-rating">
            {[...Array(fullStars)].map((_, i) => (<svg key={`full-${i}`} viewBox="0 0 24 24" fill="currentColor"><path d={starPath} /></svg>))}
            {halfStar && (<svg key="half" viewBox="0 0 24 24"><defs><clipPath id="half-star-clip-rtl-explore"><rect x="12" y="0" width="12" height="24" /></clipPath></defs><path d={starPath} fill={emptyStarColor} /><path d={starPath} fill="currentColor" clipPath="url(#half-star-clip-rtl-explore)" /></svg>)}
            {[...Array(emptyStars)].map((_, i) => (<svg key={`empty-${i}`} viewBox="0 0 24 24" fill={emptyStarColor}><path d={starPath} /></svg>))}
        </div>
    );
};

const CompanyCardSkeleton: React.FC = () => (
    <div className="company-explore-card skeleton">
        <div className="card-cover-section skeleton-cover"></div>
        <div className="card-info-section">
            <div className="card-info-header">
                <div className="skeleton skeleton-line" style={{ width: '60%', height: '20px' }}></div>
                <div className="skeleton skeleton-icon"></div>
            </div>
            <div className="skeleton skeleton-line" style={{ width: '40%', height: '16px' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '90%' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '80%' }}></div>
        </div>
    </div>
);


interface ExploreScreenProps {
  className?: string;
  onNavigateBack: () => void;
  onOpenChat: (user: { name: string; avatarUrl: string }) => void;
  onOpenProfile: (user: any) => void;
}

const sortOptions: { [key: string]: string } = {
  rating: 'الأعلى تقييماً',
  reviews: 'الأكثر مراجعة',
  trucks: 'الأكبر أسطولاً',
  newest: 'الأحدث',
};


const ExploreScreen: React.FC<ExploreScreenProps> = ({ className, onNavigateBack, onOpenChat, onOpenProfile }) => {
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [truckTypes, setTruckTypes] = useState<string[]>([]);
  const [workClassifications, setWorkClassifications] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTruckType, setSelectedTruckType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState('rating');
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<{
    title: string;
    items: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
  } | null>(null);


  const isInitialMount = useRef(true);
  const isMounted = useRef(true);
  
   useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCompanies = useCallback(async (page: number, isNewSearch = false) => {
    if (page > 1) setIsLoadingMore(true);
    else setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: '10', sortBy });
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedTruckType) params.append('truckType', selectedTruckType);
    if (selectedCategory && selectedCategory !== 'الكل') params.append('workClassification', selectedCategory);

    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/explore/companies?${params.toString()}`);
        if (!res.ok) throw new Error('فشل في جلب الشركات. حاول مرة أخرى.');
        const data = await res.json();
        if (!isMounted.current) return;
        setCompanies(prev => (page === 1 || isNewSearch) ? (data.companies || []) : [...prev, ...(data.companies || [])]);
        setPagination(data.pagination);
    } catch (err: any) {
        if (!isMounted.current) return;
        setError(err.message);
    } finally {
        if (!isMounted.current) return;
        setIsLoading(false);
        setIsLoadingMore(false);
    }
  }, [debouncedSearchTerm, selectedCity, selectedTruckType, sortBy, selectedCategory]);

  // Initial data load effect
  useEffect(() => {
    isInitialMount.current = true;
    setIsLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/explore/companies/featured`).then(res => res.ok ? res.json() : { companies: [] }),
      fetch(`${API_BASE_URL}/api/v1/explore/cities`).then(res => res.ok ? res.json() : { cities: [] }),
      fetch(`${API_BASE_URL}/api/v1/explore/truck-types`).then(res => res.ok ? res.json() : { truckTypes: [] }),
      fetch(`${API_BASE_URL}/api/v1/explore/work-classifications`).then(res => res.ok ? res.json() : { workClassifications: [] }),
      fetch(`${API_BASE_URL}/api/v1/explore/companies?page=1&limit=10&sortBy=rating`).then(res => res.ok ? res.json() : { companies: [], pagination: null })
    ]).then(([featuredData, citiesData, truckTypesData, classificationsData, allCompaniesData]) => {
      if (!isMounted.current) return;
      setFeaturedCompanies(featuredData.companies || []);
      setCities(citiesData.cities || []);
      setTruckTypes(truckTypesData.truckTypes || []);
      setWorkClassifications(classificationsData.workClassifications || []);
      setCompanies(allCompaniesData.companies || []);
      setPagination(allCompaniesData.pagination);
    }).catch(err => {
      if (!isMounted.current) return;
      setError(err.message || 'فشل في تحميل البيانات الأولية.');
    }).finally(() => {
      if (!isMounted.current) return;
      setIsLoading(false);
      isInitialMount.current = false;
    });
  }, []);

  // Effect for subsequent fetches
  useEffect(() => {
    if (isInitialMount.current) return;
    fetchCompanies(currentPage, currentPage === 1);
  }, [currentPage, debouncedSearchTerm, selectedCity, selectedTruckType, sortBy, selectedCategory, fetchCompanies]);

  // Reset page when filters change
  useEffect(() => {
    if (!isInitialMount.current) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, selectedCity, selectedTruckType, sortBy, selectedCategory]);

  const handleLoadMore = () => {
    if (pagination?.hasMore) {
        setCurrentPage(prev => prev + 1);
    }
  };
  
  const handleOpenSheet = (
    title: string,
    items: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    setSheetConfig({ title, items, selectedValue, onSelect });
    setIsSheetOpen(true);
  };

  const handleSelectItem = (item: string) => {
    if (sheetConfig) {
      sheetConfig.onSelect(item);
    }
    setIsSheetOpen(false);
  };

  const hasActiveFilters = !!(debouncedSearchTerm || selectedCity || selectedTruckType || (selectedCategory && selectedCategory !== 'الكل'));
  const showFeatured = !hasActiveFilters;

  return (
    <div className={`app-container explore-container ${className || ''}`}>
      <header className="explore-header">
        <button onClick={onNavigateBack} className="back-button" aria-label="الرجوع">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <h1>استكشاف الشركات</h1>
      </header>
      <div className="explore-filters">
        <div className="search-bar-explore"><input type="text" placeholder="ابحث بالاسم، المدينة، الوصف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="filter-row">
           <button className="filter-btn" onClick={() => handleOpenSheet('اختر مدينة', ['الكل', ...cities], selectedCity || 'الكل', (value) => setSelectedCity(value === 'الكل' ? '' : value))}>
            {selectedCity || 'كل المدن'}
          </button>
          <button className="filter-btn" onClick={() => handleOpenSheet('اختر نوع الشاحنة', ['الكل', ...truckTypes], selectedTruckType || 'الكل', (value) => setSelectedTruckType(value === 'الكل' ? '' : value))}>
            {selectedTruckType || 'كل الشاحنات'}
          </button>
          <button className="filter-btn" onClick={() => handleOpenSheet('فرز حسب', Object.values(sortOptions), sortOptions[sortBy], (value) => {
            const key = Object.keys(sortOptions).find(k => sortOptions[k as keyof typeof sortOptions] === value) || 'rating';
            setSortBy(key);
          })}>
            {sortOptions[sortBy]}
          </button>
          <button className="filter-btn" onClick={() => handleOpenSheet('اختر تصنيف', ['الكل', ...workClassifications], selectedCategory, setSelectedCategory)}>
            {selectedCategory === 'الكل' ? 'حسب التصنيفات' : selectedCategory}
          </button>
        </div>
      </div>

      <main className="app-content explore-content">
        {error && <div className="explore-feedback error">{error}</div>}
        <div className="explore-feed">
          {showFeatured && (
            <section className="featured-section">
                <h2>الشركات المميزة</h2>
                <div className="featured-grid">
                    {isLoading && featuredCompanies.length === 0 ? [...Array(2)].map((_, i) => <CompanyCardSkeleton key={i} />) : featuredCompanies.map(company => <CompanyCard key={company._id} company={company} onOpenProfile={onOpenProfile} onOpenChat={onOpenChat} />)}
                </div>
            </section>
          )}
          
          <section className="results-section">
              {hasActiveFilters && <h2>نتائج البحث</h2>}
              {isLoading ? (
                  [...Array(5)].map((_, i) => <CompanyCardSkeleton key={i} />)
              ) : companies.length > 0 ? (
                  companies.map(company => <CompanyCard key={company._id} company={company} onOpenProfile={onOpenProfile} onOpenChat={onOpenChat} />)
              ) : (
                  <div className="explore-feedback">{hasActiveFilters ? 'لا توجد نتائج تطابق بحثك.' : 'لا توجد شركات لعرضها حالياً.'}</div>
              )}
          </section>

          {isLoadingMore && <CompanyCardSkeleton />}
          {pagination?.hasMore && !isLoadingMore && !isLoading && (
            <button className="load-more-btn" onClick={handleLoadMore}>تحميل المزيد</button>
          )}
        </div>
      </main>

      {isSheetOpen && sheetConfig && (
        <div className="sheet-overlay" onClick={() => setIsSheetOpen(false)}>
          <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle-bar"></div>
            <h3>{sheetConfig.title}</h3>
            <div className="sheet-list">
              {sheetConfig.items.map(item => (
                <button
                  key={item}
                  className={`sheet-item ${sheetConfig.selectedValue === item || (sheetConfig.selectedValue === '' && item === 'الكل') ? 'active' : ''}`}
                  onClick={() => handleSelectItem(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CompanyCard: React.FC<{ company: any; onOpenProfile: (company: any) => void; onOpenChat: (user: any) => void; }> = ({ company, onOpenProfile, onOpenChat }) => {
    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenChat({ name: company.name || company.companyName, avatarUrl: getFullImageUrl(company.avatar) || '' });
    };

    return (
        <div className="company-explore-card" onClick={() => onOpenProfile(company)}>
            <div className="card-cover-section">
                <img src={getFullImageUrl(company.coverImage) || `https://source.unsplash.com/random/400x200?road,landscape&c=${company._id}`} alt={`${company.name} cover`} className="card-cover-image" />
                <img src={getFullImageUrl(company.avatar) || `https://ui-avatars.com/api/?name=${(company.name || '?').charAt(0)}&background=3498db&color=fff&size=128`} alt={company.name} className="card-avatar-on-cover" />
            </div>
            <div className="card-info-section">
                <div className="card-info-header">
                    <h3>{company.name || company.companyName}</h3>
                    <div className="card-actions-group">
                        <div className="card-rating-display" title={`${company.reviewCount} مراجعة`}>
                            {company.rating > 0 ? (
                              <>
                                <StarRating rating={company.rating} />
                                <span>({company.rating.toFixed(1)} من 5)</span>
                              </>
                            ) : (
                              <span className="no-rating">لا توجد تقييمات</span>
                            )}
                        </div>
                        <button className="card-chat-btn-explore" onClick={handleChatClick} aria-label={`مراسلة ${company.name}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                    </div>
                </div>
                <div className="card-meta-info">
                    <span>{company.reviewCount || 0} مراجعة</span>
                    <span>•</span>
                    <span>{company.truckCount > 0 ? `${company.truckCount} شاحنة` : 'لم يحدد'}</span>
                     <span>•</span>
                    <span>{company.city || 'غير محدد'}</span>
                </div>
                <p>{company.description || 'لا يوجد وصف متاح لهذه الشركة.'}</p>
            </div>
        </div>
    );
};

export default ExploreScreen;