import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import '../signup/SignUp.css';
import './Profile.css';
import type { CachedProfileData } from '../../App';

const getFullImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('data:image') || url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

interface EditProfileCompanyScreenProps {
  className?: string;
  onNavigateBack: (refresh?: boolean) => void;
  onSave: (profileData: any) => void;
  profileCache: Map<string, CachedProfileData>;
  setSavingState: React.Dispatch<React.SetStateAction<{ isSaving: boolean; messages: string[] }>>;
}

const EditProfileCompanyScreen: React.FC<EditProfileCompanyScreenProps> = ({
  className,
  onNavigateBack,
  onSave,
  profileCache,
  setSavingState,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fleetImages, setFleetImages] = useState<string[]>([]);
  const [licenseImages, setLicenseImages] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [streetName, setStreetName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [truckCount, setTruckCount] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');
  const [workClassification, setWorkClassification] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const fleetFileInputRef = useRef<HTMLInputElement>(null);
  const licenseFileInputRef = useRef<HTMLInputElement>(null);
  
  const isFormValid = companyName.trim() !== '' && country.trim() !== '' && city.trim() !== '' && truckCount.trim() !== '' && registrationNumber.trim() !== '';

  const isActive = className?.includes('page-active');

  useEffect(() => {
    if (isActive) {
      setIsLoading(true);
      const cachedData = profileCache.get('me');
      if (cachedData?.profile) {
        const profile = cachedData.profile;
        setCompanyName(profile.companyName || profile.name || '');
        setCompanyEmail(profile.companyEmail || profile.email || '');
        setPhone(profile.phone || '');
        setCoverImage(profile.coverImage || null);
        setProfileImage(profile.avatar || null);
        setFleetImages(profile.fleetImages || []);
        setLicenseImages(profile.licenseImages || []);
        setCountry(profile.country || '');
        setCity(profile.city || '');
        setStreetName(profile.streetName || '');
        setDistrictName(profile.districtName || '');
        setWebsiteLink(profile.website || '');
        setTruckCount(profile.truckCount?.toString() || '');
        setRegistrationNumber(profile.registrationNumber || '');
        setDescription(profile.description || '');
        setWorkClassification(profile.workClassification || '');
        setIsLoading(false);
      } else {
        setIsLoading(false);
        console.error("Profile data not found in cache for editing.");
      }
    }
  }, [isActive, profileCache]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => { setter(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleMultiFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        const readPromises = filesArray.map((file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') { resolve(reader.result); } else { reject(new Error('Failed to read file.')); }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }));
        Promise.all(readPromises).then(base64Images => { setter(prev => [...prev, ...base64Images]); });
      }
  };

  const handleRemoveImage = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = () => {
    console.log('🔍 محاولة حفظ التعديلات...');
    console.log('✅ صحة النموذج:', isFormValid);
    
    if (!isFormValid) {
        console.log('❌ النموذج غير صالح، الحقول المطلوبة:');
        console.log('- اسم الشركة:', companyName.trim() !== '' ? '✓' : '✗');
        console.log('- الدولة:', country.trim() !== '' ? '✓' : '✗');
        console.log('- المدينة:', city.trim() !== '' ? '✓' : '✗');
        console.log('- عدد الشاحنات:', truckCount.trim() !== '' ? '✓' : '✗');
        console.log('- رقم التسجيل:', registrationNumber.trim() !== '' ? '✓' : '✗');
        return;
    }
    
    const fullAddress = [streetName, districtName, city, country].filter(Boolean).join(', ');
    const profileData = {
        companyName: companyName,
        phone: phone,
        companyEmail: companyEmail,
        avatar: profileImage,
        coverImage: coverImage,
        fleetImages: fleetImages,
        licenseImages: licenseImages,
        country,
        city,
        streetName,
        districtName,
        address: fullAddress,
        website: websiteLink,
        truckCount: Number(truckCount) || 0,
        registrationNumber: registrationNumber,
        description: description,
        workClassification: workClassification,
    };
    
    console.log('📦 البيانات المرسلة:', {
        ...profileData,
        avatar: profileImage ? (profileImage.startsWith('data:') ? 'صورة جديدة (base64)' : 'صورة موجودة') : 'لا توجد',
        coverImage: coverImage ? (coverImage.startsWith('data:') ? 'صورة جديدة (base64)' : 'صورة موجودة') : 'لا توجد',
        fleetImages: `${fleetImages.length} صورة`,
        licenseImages: `${licenseImages.length} صورة`,
    });
    
    onSave(profileData);
};
  
  if (isLoading && isActive) {
      return (
         <div className={`app-container signup-screen-container create-profile-screen-container ${className || ''}`}>
            <div className="create-profile-form-wrapper">
                <p style={{color: 'white', textAlign: 'center', paddingTop: '50%'}}>جارٍ تحميل البيانات...</p>
            </div>
         </div>
      )
  }
  
  return (
    <div className={`app-container signup-screen-container create-profile-screen-container ${className || ''}`}>
      <div className="create-profile-form-wrapper">
        <header className="signup-screen-header create-profile-header">
          <button onClick={() => onNavigateBack(false)} className="back-button" aria-label="الرجوع">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="logo-container">
            <span className="logo-text">تعديل الملف الشخصي</span>
          </div>
          <button className="header-create-btn" onClick={handleSaveChanges} disabled={!isFormValid}>حفظ</button>
        </header>

        <main className="app-content create-profile-main-content">
          <div className="create-profile-image-section">
            <input type="file" ref={coverFileInputRef} onChange={(e) => handleFileChange(e, setCoverImage)} style={{ display: 'none' }} accept="image/*" />
            <div className="create-profile-cover-upload" onClick={() => coverFileInputRef.current?.click()}>
              {coverImage ? <img src={getFullImageUrl(coverImage)} alt="Cover Preview" className="create-profile-cover-preview" /> : <div className="create-profile-cover-placeholder"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg><span>إضافة صورة غلاف</span></div>}
            </div>
            <input type="file" ref={profileFileInputRef} onChange={(e) => handleFileChange(e, setProfileImage)} style={{ display: 'none' }} accept="image/*" />
            <div className="create-profile-avatar-upload" onClick={() => profileFileInputRef.current?.click()}>
              {profileImage ? <img src={getFullImageUrl(profileImage)} alt="Profile Preview" className="create-profile-avatar-preview" /> : <div className="create-profile-avatar-placeholder"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg><p>إضافة شعار</p></div>}
            </div>
          </div>
          
          <div className="create-profile-form-content">
              <div className="form-section">
                <h3 className="form-section-title">اسم الشركة</h3>
                <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1" /></svg>
                    <input type="text" placeholder="اسم الشركة" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">موقع الشركة</h3>
                <div className="form-row">
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.25 9.75h17.5M9.75 3.25l.25 17.5M14.25 3.25l-.25 17.5" /></svg>
                        <input type="text" placeholder="الدولة" value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18h16.5M4.5 21V3m15 18V3" /></svg>
                        <input type="text" placeholder="المدينة" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                </div>
                 <div className="form-row">
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18h16.5M5.25 6h13.5m-13.5 3h13.5m-13.5 3h13.5m-13.5 3h13.5" /></svg>
                        <input type="text" placeholder="اسم المنطقة/الحي" value={districtName} onChange={(e) => setDistrictName(e.target.value)} />
                    </div>
                    <div className="form-group">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        <input type="text" placeholder="اسم الشارع" value={streetName} onChange={(e) => setStreetName(e.target.value)} />
                    </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">البريد الإلكتروني للشركة</h3>
                <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <input type="email" placeholder="البريد الإلكتروني للشركة" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                </div>
              </div>

               <div className="form-section">
                <h3 className="form-section-title">معلومات الأسطول</h3>
                <div className="form-row">
                  <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M5 9h14M5 15h14" /></svg>
                    <input type="number" placeholder="عدد الشاحنات" value={truckCount} onChange={(e) => setTruckCount(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    <input type="text" placeholder="رقم التسجيل" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">وصف الشركة (اختياري)</h3>
                <div className="form-group form-group-textarea">
                    <textarea id="company-description" rows={4} placeholder="أدخل وصفًا تفصيليًا للشركة..." aria-label="وصف الشركة" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">رقم الهاتف</h3>
                <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <input type="tel" placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">رابط موقع الشركة على الخريطة (اختياري)</h3>
                <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <input type="url" placeholder="https://maps.google.com/..." value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} />
                </div>
              </div>

              <div className="form-section fleet-section">
                <h3 className="form-section-title">صور الأسطول (اختياري)</h3>
                <div className="fleet-image-uploader">
                  <input type="file" ref={fleetFileInputRef} onChange={(e) => handleMultiFileChange(e, setFleetImages)} style={{ display: 'none' }} accept="image/*" multiple />
                  <div className="fleet-image-list">
                    {fleetImages.map((img, index) => (<div key={index} className="fleet-image-item"><img src={getFullImageUrl(img)} alt={`Fleet ${index}`} /><button type="button" className="remove-fleet-img-btn" onClick={() => handleRemoveImage(index, setFleetImages)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button></div>))}
                    <button type="button" className="add-fleet-image-btn" onClick={() => fleetFileInputRef.current?.click()}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="form-section-title">تصنيف عمل الشركة</h3>
                <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
                    <input type="text" placeholder="مثال: بضائع، ثلاجة، نقل عفش، سطحة" value={workClassification} onChange={(e) => setWorkClassification(e.target.value)} />
                </div>
              </div>

              <div className="form-section fleet-section">
                <h3 className="form-section-title">صور التراخيص (اختياري)</h3>
                <div className="fleet-image-uploader">
                  <input type="file" ref={licenseFileInputRef} onChange={(e) => handleMultiFileChange(e, setLicenseImages)} style={{ display: 'none' }} accept="image/*" multiple />
                  <div className="fleet-image-list">
                    {licenseImages.map((img, index) => (<div key={index} className="fleet-image-item"><img src={getFullImageUrl(img)} alt={`License ${index + 1}`} /><button type="button" className="remove-fleet-img-btn" onClick={() => handleRemoveImage(index, setLicenseImages)} aria-label={`إزالة صورة الترخيص ${index + 1}`}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></button></div>))}
                    <button type="button" className="add-fleet-image-btn" onClick={() => licenseFileInputRef.current?.click()}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>
                  </div>
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProfileCompanyScreen;