import React, { useState, useEffect } from 'react';
import PasswordStrengthMeter from '../shared/PasswordStrengthMeter';
import './SignUp.css';
import './CreateCompanyProfileScreen.css'; // Import styles for the header layout

const SignUpCompanyScreen: React.FC<{
  className?: string;
  onNavigateBack: () => void;
  onProceedToProfile: (data: any) => void;
}> = ({ className, onNavigateBack, onProceedToProfile }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const passwordMatch = password === confirmPassword;
    if (!passwordMatch && confirmPassword.length > 0 && password.length > 0) {
        setError('كلمتا المرور غير متطابقتين.');
    } else {
        setError(null);
    }

    const isValid = companyName.trim() !== '' &&
                    email.trim() !== '' &&
                    phone.trim() !== '' &&
                    password.trim() !== '' &&
                    confirmPassword.trim() !== '' &&
                    passwordMatch;
    setIsFormValid(isValid);
  }, [companyName, email, phone, password, confirmPassword]);


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        if (password !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
        } else {
            setError('يرجى ملء جميع الحقول المطلوبة.');
        }
        return;
    }
    
    onProceedToProfile({
        name: companyName, // API expects 'name'
        companyName: companyName,
        email,
        phone,
        password,
    });
  };

  return (
    <div className={`app-container signup-screen-container ${className || ''}`}>
      {/* Background from splash screen */}
      <div className="map-background">
        <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <path className="map-path" d="M100,250 C300,100 600,400 900,250" />
          <path className="map-path" d="M50,150 C250,300 500,50 800,200" />
          <path className="map-path" d="M200,450 C400,350 700,400 950,150" />
        </svg>
      </div>

      <header className="signup-screen-header create-profile-header">
        <button onClick={onNavigateBack} className="back-button" aria-label="الرجوع">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="logo-container">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="logo-text">شحن سريع</span>
        </div>
         <button
            type="submit"
            form="signup-company-form"
            className="header-create-btn"
            disabled={!isFormValid}
        >
            التالي
        </button>
      </header>

      <main className="app-content signup-screen-content">
        <h1 className="signup-title">إنشاء حساب شركة</h1>
        {error && <p className="signup-error">{error}</p>}
        <form className="signup-screen-form" onSubmit={handleFormSubmit} id="signup-company-form">
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1" /></svg>
            <input type="text" placeholder="اسم الشركة" required aria-label="اسم الشركة" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <input type="email" placeholder="البريد الإلكتروني" required aria-label="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
           <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            <input type="tel" placeholder="رقم الهاتف" required aria-label="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <input type="password" placeholder="كلمة المرور" required aria-label="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <input type="password" placeholder="تأكيد كلمة المرور" required aria-label="تأكيد كلمة المرور" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <PasswordStrengthMeter password={password} />
        </form>
      </main>
    </div>
  );
};

export default SignUpCompanyScreen;