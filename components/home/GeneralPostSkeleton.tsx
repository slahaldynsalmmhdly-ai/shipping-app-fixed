import React from 'react';
import './GeneralPostSkeleton.css';
import '../home/ShipmentPost.css';
import '../home/GeneralPost.css';
import '../home/PostFooter.css';

const GeneralPostSkeleton: React.FC = () => {
    return (
        <div className="general-post shipment-post skeleton-post-wrapper">
            <header className="general-post-header">
                <div className="post-identity">
                    <div className="skeleton skeleton-avatar"></div>
                    <div className="post-author-details">
                        <div className="skeleton skeleton-line" style={{ width: '120px' }}></div>
                        <div className="skeleton skeleton-line" style={{ width: '50px', height: '10px' }}></div>
                    </div>
                </div>
                <div className="post-header-actions">
                    <div className="skeleton skeleton-icon-btn"></div>
                </div>
            </header>
            <div className="general-post-body">
                <div style={{ padding: '4px 16px 16px'}}>
                    <div className="skeleton skeleton-line" style={{ width: '90%', marginBottom: '8px' }}></div>
                    <div className="skeleton skeleton-line" style={{ width: '70%' }}></div>
                </div>
                <div className="skeleton skeleton-media"></div>
            </div>
            <div className="post-footer">
                 <div className="post-stats">
                    <div className="skeleton skeleton-stats"></div>
                </div>
                <div className="post-footer-actions">
                    <div className="skeleton skeleton-action-btn"></div>
                    <div className="skeleton skeleton-action-btn"></div>
                    <div className="skeleton skeleton-action-btn"></div>
                    <div className="skeleton skeleton-action-btn"></div>
                </div>
            </div>
        </div>
    );
};

export default GeneralPostSkeleton;
