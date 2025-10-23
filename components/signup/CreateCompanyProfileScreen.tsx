import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import './SignUp.css';
import './CreateCompanyProfileScreen.css';
import SavingIndicator from '../shared/SavingIndicator';

interface CreateCompanyProfileScreenProps {
  className?: string;
  onNavigateBack: () => void;
  onFinalizeSignup: (profileData: any) => void;
}

const CreateCompanyProfileScreen: React.FC<CreateCompanyProfileScreenProps> = ({
  className,
  onNavigateBack,
  onFinalizeSignup,
}) => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fleetImages, setFleetImages] = useState<string[]>([]);
  const [licenseImages, setLicenseImages] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [streetName, setStreetName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [truckCount, setTruckCount] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');
  const [workClassification, setWorkClassification] = useState('');

  const [savingState, setSavingState] = useState({ isSaving: false, messages: [] as string[] });

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const fleetFileInputRef = useRef<HTMLInputElement>(null);
  const licenseFileInputRef = useRef<HTMLInputElement>(null);
  
  const isFormValid = country.trim() !== '' && city.trim() !== '' && truckCount.trim() !== '' && registrationNumber.trim() !== '';

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFleetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Fix: Explicitly type `file` as `File` to prevent TypeScript from inferring it as `unknown`.
      // This resolves the error "Argument of type 'unknown' is not assignable to parameter of type 'Blob'".
      const readPromises = filesArray.map((file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Fix: Ensure that reader.result is a string before resolving.
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as data URL.'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
      Promise.all(readPromises).then(base64Images => {
        setFleetImages(prev => [...prev, ...base64Images]);
      });
    }
  };

  const handleRemoveFleetImage = (index: number) => {
    setFleetImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const readPromises = filesArray.map((file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as data URL.'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
      Promise.all(readPromises).then(base64Images => {
        setLicenseImages(prev => [...prev, ...base64Images]);
      });
    }
  };

  const handleRemoveLicenseImage = (index: number) => {
    setLicenseImages(prev => prev.filter((_, i) => i !== index));
  };


  const handleFinalize = () => {
    if (!isFormValid) return;
    
    const fullAddress = [streetName, districtName, city, country].filter(Boolean).join(', ');
    const profileData = {
        avatar: profileImage,
        coverImage: coverImage,
        fleetImages: fleetImages,
        licenseImages: licenseImages,
        country,
        city,
        streetName,
        districtName,
        address: fullAddress,
        companyEmail: companyEmail,
        website: websiteLink,
        truckCount: Number(truckCount) || 0,
        registrationNumber: registrationNumber,
        description: description,
        workClassification: workClassification,
    };
    onFinalizeSignup(profileData);
  };


  return (
    <>
      {savingState.isSaving && <SavingIndicator messages={savingState.messages} />}
      <div className={`app-container signup-screen-container create-profile-screen-container ${className || ''}`}>
        <div className="map-background">
          <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
            <path className="map-path" d="M100,250 C300,100 600,400 900,250" />
            <path className="map-path" d="M50,150 C250,300 500,50 800,200" />
            <path className="map-path" d="M200,450 C400,350 700,400 950,150" />
          </svg>
        </div>
        
        <div className="create-profile-form-wrapper">
          <header className="signup-screen-header create-profile-header">
            <button onClick={onNavigateBack} className="back-button" aria-label="الرجوع">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="logo-container">
               <span className="logo-text">إكمال الملف الشخصي</span>
            </div>
             <button className="header-create-btn" onClick={handleFinalize} disabled={!isFormValid}>
              إنشاء
            </button>
          </header>

          <main className="app-content create-profile-main-content">
            <div className="create-profile-image-section">
              <input type="file" ref={coverFileInputRef} onChange={(e) => handleFileChange(e, setCoverImage)} style={{ display: 'none' }} accept="image/*" />
              <div className="create-profile-cover-upload" onClick={() => coverFileInputRef.current?.click()}>
                {coverImage ? (
                  <img src={coverImage} alt="Cover Preview" className="create-profile-cover-preview" />
                ) : (
                  <div className="create-profile-cover-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
                    <span>إضافة صورة غلاف</span>
                  </div>
                )}
              </div>
              <input type="file" ref={profileFileInputRef} onChange={(e) => handleFileChange(e, setProfileImage)} style={{ display: 'none' }} accept="image/*" />
              <div className="create-profile-avatar-upload" onClick={() => profileFileInputRef.current?.click()}>
                 {profileImage ? (
                    <img src={profileImage} alt="Profile Preview" className="create-profile-avatar-preview" />
                 ) : (
                    <div className="create-profile-avatar-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p>إضافة شعار</p>
                    </div>
                 )}
              </div>
            </div>
            
            <div className="create-profile-form-content">
              <div className="form-section">
                <h3 className="form-section-title">موقع الشركة</h3>
                <div className="form-row">
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.25 9.75h17.5M9.75 3.25l.25 17.5M14.25 3.25l-.25 17.5" />
                        </svg>
                        <input
                            type="text"
                            placeholder="الدولة"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18h16.5M4.5 21V3m15 18V3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="المدينة"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>
                </div>
                 <div className="form-row">
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18h16.5M5.25 6h13.5m-13.5 3h13.5m-13.5 3h13.5m-13.5 3h13.5" />
                        </svg>
                        <input
                            type="text"
                            placeholder="اسم المنطقة/الحي"
                            value={districtName}
                            onChange={(e) => setDistrictName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="اسم الشارع"
                            value={streetName}
                            onChange={(e) => setStreetName(e.target.value)}
                        />
                    </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">البريد الإلكتروني للشركة</h3>
                <div className="form-group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
                  </svg>
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني للشركة"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                  />
                </div>
              </div>

               <div className="form-section">
                <h3 className="form-section-title">معلومات الأسطول</h3>
                <div className="form-row">
                  <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M5 9h14M5 15h14" />
                    </svg>
                    <input
                      type="number"
                      placeholder="عدد الشاحنات"
                      value={truckCount}
                      onChange={(e) => setTruckCount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="رقم التسجيل"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">وصف الشركة (اختياري)</h3>
                <div className="form-group form-group-textarea">
                    <textarea
                        id="company-description"
                        rows={4}
                        placeholder="أدخل وصفًا تفصيليًا للشركة..."
                        aria-label="وصف الشركة"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">رابط موقع الشركة على الخريطة (اختياري)</h3>
                <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                    />
                </div>
              </div>


              <div className="form-section fleet-section">
                <h3 className="form-section-title">صور الأسطول (اختياري)</h3>
                <div className="fleet-image-uploader">
                  <input type="file" ref={fleetFileInputRef} onChange={handleFleetFileChange} style={{ display: 'none' }} accept="image/*" multiple />
                  <div className="fleet-image-list">
                    {fleetImages.map((img, index) => (
                      <div key={index} className="fleet-image-item">
                        <img src={img} alt={`Fleet ${index}`} />
                        <button className="remove-fleet-img-btn" onClick={() => handleRemoveFleetImage(index)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" className="add-fleet-image-btn" onClick={() => fleetFileInputRef.current?.click()}>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="form-section-title">تصنيف عمل الشركة</h3>
                <div className="form-group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="مثال: بضائع، ثلاجة، نقل عفش، سطحة"
                        value={workClassification}
                        onChange={(e) => setWorkClassification(e.target.value)}
                    />
                </div>
              </div>

              <div className="form-section fleet-section">
                <h3 className="form-section-title">صور التراخيص (اختياري)</h3>
                <div className="fleet-image-uploader">
                  <input type="file" ref={licenseFileInputRef} onChange={handleLicenseFileChange} style={{ display: 'none' }} accept="image/*" multiple />
                  <div className="fleet-image-list">
                    {licenseImages.map((img, index) => (
                      <div key={index} className="fleet-image-item">
                        <img src={img} alt={`License ${index + 1}`} />
                        <button className="remove-fleet-img-btn" onClick={() => handleRemoveLicenseImage(index)} aria-label={`إزالة صورة الترخيص ${index + 1}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" className="add-fleet-image-btn" onClick={() => licenseFileInputRef.current?.click()}>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CreateCompanyProfileScreen;