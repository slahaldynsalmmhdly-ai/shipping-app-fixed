

import React, { useState, useEffect } from 'react';
import MediaUpload from '../shared/MediaUpload';
import './Ads.css';
import { API_BASE_URL } from '../../config';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('data:image') || url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

interface CreateTruckAdScreenProps {
  className?: string;
  onNavigateBack: () => void;
  onPublishAd: (adData: { currentLocation: string; preferredDestination: string; availabilityDate: string; truckType: string; additionalNotes: string; mediaFile: File | null; }) => void;
  coinBalance: number;
  isAdToBeFeatured: boolean;
  setIsAdToBeFeatured: (value: React.SetStateAction<boolean>) => void;
  onOpenSubscriptionModal: () => void;
  itemToEdit: any | null;
}

const CreateTruckAdScreen: React.FC<CreateTruckAdScreenProps> = ({ className, onNavigateBack, onPublishAd, coinBalance, isAdToBeFeatured, setIsAdToBeFeatured, onOpenSubscriptionModal, itemToEdit }) => {
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [truckType, setTruckType] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const isEditMode = !!itemToEdit;

  useEffect(() => {
    if (isEditMode) {
        setCurrentLocation(itemToEdit.currentLocation || '');
        setDestination(itemToEdit.preferredDestination || '');
        setTruckType(itemToEdit.truckType || '');
        const date = itemToEdit.availabilityDate ? new Date(itemToEdit.availabilityDate).toISOString().split('T')[0] : '';
        setAvailableDate(date);
        setAdditionalNotes(itemToEdit.additionalNotes || '');
        if (itemToEdit.media && itemToEdit.media.length > 0) {
            setMediaPreview(getFullImageUrl(itemToEdit.media[0].url));
            setMediaFile(null);
        }
    } else {
        setCurrentLocation('');
        setDestination('');
        setTruckType('');
        setAvailableDate('');
        setAdditionalNotes('');
        setMediaPreview(null);
        setMediaFile(null);
    }
  }, [itemToEdit, isEditMode]);


  useEffect(() => {
    const isValid = currentLocation.trim() !== '' &&
                    truckType.trim() !== '' &&
                    availableDate.trim() !== '';
    setIsFormValid(isValid);
  }, [currentLocation, truckType, availableDate]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    onPublishAd({
      currentLocation,
      preferredDestination: destination,
      availabilityDate: availableDate,
      truckType,
      additionalNotes,
      mediaFile,
    });
  };

  const handleFeatureAdToggle = () => {
    if (coinBalance > 0) {
      setIsAdToBeFeatured(prev => !prev);
    } else {
      onOpenSubscriptionModal();
    }
  };

  return (
    <div className={`app-container ad-creation-container ${className || ''}`}>
      <header className="ad-creation-header">
          <button type="button" onClick={onNavigateBack} className="ad-header-btn close-btn" aria-label="إغلاق">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1>{isEditMode ? 'تعديل إعلان شاحنة' : 'إعلان شاحنة فارغة'}</h1>
      </header>
       <main className="app-content">
          <form className="ad-creation-form" onSubmit={handleFormSubmit} id="create-truck-ad-form">
            <section className="form-section">
                <h2>تفاصيل الشاحنة</h2>
                <div className="form-row">
                    <div className="form-group">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <input type="text" placeholder="الموقع الحالي" required aria-label="الموقع الحالي للشاحنة" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.75M9 11.25h6.75M9 15.75h6.75M9 20.25h6.75" />
                      </svg>
                      <input type="text" placeholder="الوجهة المفضلة (اختياري)" aria-label="الوجهة المفضلة" value={destination} onChange={e => setDestination(e.target.value)} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16l2 2h3.5a1 1 0 001-1V9a1 1 0 00-1-1h-3.5l-2-2z" />
                      </svg>
                      <input type="text" placeholder="نوع الشاحنة" required aria-label="نوع الشاحنة" value={truckType} onChange={(e) => setTruckType(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
                      </svg>
                      <input type="date" placeholder="تاريخ التوفر" required aria-label="تاريخ التوفر" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} />
                    </div>
                </div>
                 <div className="form-group-textarea">
                  <label htmlFor="truck-notes">ملاحظات إضافية</label>
                  <textarea
                    id="truck-notes"
                    rows={4}
                    placeholder="مثال: الشاحنة مجهزة بمبرد، السائق متاح للمساعدة..."
                    aria-label="ملاحظات إضافية"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  ></textarea>
                </div>
            </section>

             <section className="form-section">
                <h2>المرفقات</h2>
                <MediaUpload mediaPreview={mediaPreview} setMediaPreview={setMediaPreview} onFileChange={setMediaFile} />
             </section>

             <section className="form-section feature-toggle-section">
                <div className="feature-toggle-text">
                    <h2>تمييز الإعلان</h2>
                    <p>تمييز الإعلان يجعله يظهر بشكل بارز في أعلى النتائج، مما يزيد من فرص وصوله للمستخدمين.</p>
                </div>
                <label className="switch">
                    <input type="checkbox" checked={isAdToBeFeatured} onChange={handleFeatureAdToggle} />
                    <span className="slider"></span>
                </label>
              </section>
          </form>
        </main>
        <footer className="ad-creation-footer">
            <button type="submit" form="create-truck-ad-form" className="publish-btn-footer" disabled={!isFormValid}>
                {isEditMode ? 'حفظ التعديلات' : 'نشر الإعلان'}
            </button>
        </footer>
    </div>
  );
};

export default CreateTruckAdScreen;