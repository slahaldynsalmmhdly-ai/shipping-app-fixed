import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import PasswordStrengthMeter from '../shared/PasswordStrengthMeter';
import './SignUp.css';

const SignUpIndividualScreen: React.FC<{
  className?: string;
  onNavigateBack: () => void;
  onSignupSuccess: (data: any) => void;
}> = ({ className, onNavigateBack, onSignupSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          password,
          userType: 'individual',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'فشل إنشاء الحساب');
      }
      onSignupSuccess(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app-container signup-screen-container ${className || ''}`}>
      <div className="map-background">
        <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <path className="map-path" d="M100,250 C300,100 600,400 900,250" />
          <path className="map-path" d="M50,150 C250,300 500,50 800,200" />
          <path className="map-path" d="M200,450 C400,350 700,400 950,150" />
        </svg>
      </div>

      <header className="signup-screen-header">
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
      </header>

      <main className="app-content signup-screen-content">
        <h1 className="signup-title">إنشاء حساب فردي</h1>
        {error && <p className="signup-error">{error}</p>}
        <form className="signup-screen-form" onSubmit={handleFormSubmit} id="signup-individual-form">
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <input type="text" placeholder="الاسم الكامل" required aria-label="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
          </div>
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <input type="email" placeholder="البريد الإلكتروني" required aria-label="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
          </div>
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            <input type="tel" placeholder="رقم الهاتف" required aria-label="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} />
          </div>
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <input type="password" placeholder="كلمة المرور" required aria-label="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
          </div>
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <input type="password" placeholder="تأكيد كلمة المرور" required aria-label="تأكيد كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />
          </div>
          <PasswordStrengthMeter password={password} />
        </form>
      </main>

      <footer className="app-footer signup-screen-footer">
        <button className="btn btn-primary" type="submit" form="signup-individual-form" disabled={isLoading}>
          {isLoading ? 'جارٍ الإنشاء...' : 'إنشاء حساب'}
        </button>
      </footer>
    </div>
  );
};

export default SignUpIndividualScreen;
