import React, { useState } from 'react';
import './SplashScreen.css';
import { API_BASE_URL } from '../../config';
import { auth, googleProvider, signInWithPopup, getIdToken } from '../../firebase';

const SplashScreen: React.FC<{ 
  className?: string;
  onOpenAccountTypeModal: () => void;
  onLoginSuccess: (data: { token: string; user: any }) => void;
  onOpenForgotPasswordModal: () => void;
}> = ({ className, onOpenAccountTypeModal, onLoginSuccess, onOpenForgotPasswordModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }
      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await getIdToken(result.user);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/firebase-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'فشل تسجيل الدخول باستخدام جوجل');
        }
        onLoginSuccess(data);
    } catch (err: any) {
        setError(err.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={`app-container splash-container ${className || ''}`}>
      <div className="map-background">
        <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <path className="map-path" d="M100,250 C300,100 600,400 900,250" />
          <path className="map-path" d="M50,150 C250,300 500,50 800,200" />
          <path className="map-path" d="M200,450 C400,350 700,400 950,150" />
          <path className="route" d="M100,250 C300,100 600,400 900,250" />
          <path className="route route-2" d="M50,150 C250,300 500,50 800,200" />
          <path className="route route-3" d="M200,450 C400,350 700,400 950,150" />
        </svg>
      </div>

      <div className="splash-top-content">
        <div className="logo-container">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="logo-text">شحن سريع</span>
        </div>
        
        <h1 className="headline">تتبع شحنتك بكل سهولة وأمان</h1>
        <div className="features">
          <div className="feature">
            <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16l2 2h3.5a1 1 0 001-1V9a1 1 0 00-1-1h-3.5l-2-2z" />
            </svg>
            <p>شحن سريع</p>
          </div>
          <div className="feature">
            <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>تتبع مباشر</p>
          </div>
          <div className="feature">
            <svg className="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p>موثوقية وأمان</p>
          </div>
        </div>
      </div>

      <form className="splash-login-area" onSubmit={handleEmailLogin}>
        {error && <p className="splash-error">{error}</p>}
        <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <input type="text" placeholder="البريد الإلكتروني أو رقم الهاتف" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
        </div>
        <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <input type="password" placeholder="كلمة المرور" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
        </div>
        <div className="login-links">
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenForgotPasswordModal(); }} className="forgot-password-link">نسيت كلمة السر؟</a>
            <button type="button" className="btn-google-splash" onClick={handleGoogleLogin} disabled={isLoading} aria-label="متابعة باستخدام جوجل">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
            </button>
            <a href="#" onClick={(e) => e.preventDefault()} className="forgot-password-link disabled">نسيت البريد الإلكتروني؟</a>
        </div>
        <button className="btn btn-primary" type="submit" disabled={isLoading}>{isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</button>
        <button type="button" className="btn btn-secondary" onClick={onOpenAccountTypeModal}>إنشاء حساب جديد</button>
      </form>
    </div>
  );
};

export default SplashScreen;