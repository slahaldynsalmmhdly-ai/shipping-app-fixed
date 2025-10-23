import React from 'react';
import './NewlyCreatedAdCard.css';

interface NewlyCreatedAdCardProps {
  ad: any;
  onDismiss: () => void;
}

const NewlyCreatedAdCard: React.FC<NewlyCreatedAdCardProps> = ({ ad, onDismiss }) => {
    const isCargoAd = ad.type === 'cargo';

    const renderCargoAd = () => (
        <>
            <div className="new-ad-info-row">
                <img src="https://api.iconify.design/mdi:package-up.svg?color=%237f8c8d" alt="Pickup icon" className="new-ad-info-icon" />
                <div className="new-ad-info-text">
                    <span className="label">مكان التحميل</span>
                    <span className="value">{ad.pickupLocation}</span>
                </div>
            </div>
            <div className="new-ad-info-row">
                <img src="https://api.iconify.design/mdi:map-marker-radius-outline.svg?color=%237f8c8d" alt="Destination icon" className="new-ad-info-icon" />
                <div className="new-ad-info-text">
                    <span className="label">مكان التوصيل</span>
                    <span className="value">{ad.deliveryLocation}</span>
                </div>
            </div>
            <div className="new-ad-info-grid">
                <div className="new-ad-grid-item">
                    <img src="https://api.iconify.design/mdi:truck-outline.svg?color=%237f8c8d" alt="Truck icon" className="new-ad-info-icon" />
                    <div className="new-ad-info-text">
                        <span className="label">نوع الشاحنة</span>
                        <span className="value">{ad.truckType}</span>
                    </div>
                </div>
                <div className="new-ad-grid-item">
                    <img src="https://api.iconify.design/mdi:calendar-outline.svg?color=%237f8c8d" alt="Date icon" className="new-ad-info-icon" />
                    <div className="new-ad-info-text">
                        <span className="label">تاريخ التحميل</span>
                        <span className="value">{new Date(ad.pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>
        </>
    );

    const renderEmptyTruckAd = () => (
         <>
            <div className="new-ad-info-row">
                <img src="https://api.iconify.design/mdi:map-marker-outline.svg?color=%237f8c8d" alt="Location icon" className="new-ad-info-icon" />
                <div className="new-ad-info-text">
                    <span className="label">الموقع الحالي</span>
                    <span className="value">{ad.currentLocation}</span>
                </div>
            </div>
            <div className="new-ad-info-row">
                <img src="https://api.iconify.design/mdi:map-marker-radius-outline.svg?color=%237f8c8d" alt="Destination icon" className="new-ad-info-icon" />
                <div className="new-ad-info-text">
                    <span className="label">الوجهة المفضلة</span>
                    <span className="value">{ad.preferredDestination || 'غير محدد'}</span>
                </div>
            </div>
            <div className="new-ad-info-grid">
                <div className="new-ad-grid-item">
                    <img src="https://api.iconify.design/mdi:truck-outline.svg?color=%237f8c8d" alt="Truck icon" className="new-ad-info-icon" />
                    <div className="new-ad-info-text">
                        <span className="label">نوع الشاحنة</span>
                        <span className="value">{ad.truckType}</span>
                    </div>
                </div>
                <div className="new-ad-grid-item">
                     <img src="https://api.iconify.design/mdi:calendar-outline.svg?color=%237f8c8d" alt="Date icon" className="new-ad-info-icon" />
                    <div className="new-ad-info-text">
                        <span className="label">تاريخ التوفر</span>
                        <span className="value">{new Date(ad.availabilityDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="new-ad-card">
            <header className="new-ad-card-header">
                <h3>تم نشر إعلانك بنجاح!</h3>
                <button onClick={onDismiss} className="new-ad-dismiss-btn" aria-label="إغلاق">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>
            <main className="new-ad-card-body">
                {isCargoAd ? renderCargoAd() : renderEmptyTruckAd()}
            </main>
        </div>
    );
};

export default NewlyCreatedAdCard;