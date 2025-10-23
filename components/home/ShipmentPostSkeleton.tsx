import React from 'react';
import './ShipmentPostSkeleton.css';
import '../home/ShipmentPost.css';
import '../home/GeneralPost.css';
import '../home/PostFooter.css';

const ShipmentPostSkeleton: React.FC = () => {
    return (
        <div className="general-post shipment-post skeleton-post-wrapper">
            <header className="general-post-header">
                <div className="post-identity">
                    <div className="skeleton skeleton-avatar-large"></div>
                    <div className="post-author-details">
                        <div className="skeleton skeleton-line" style={{ width: '150px' }}></div>
                        <div className="skeleton skeleton-line" style={{ width: '90px', height: '10px' }}></div>
                    </div>
                </div>
                <div className="post-header-actions">
                     <div className="skeleton skeleton-icon-btn"></div>
                </div>
            </header>
            <div className="post-body">
                <div className="post-details">
                    <div className="skeleton skeleton-detail-item"></div>
                    <div className="skeleton skeleton-detail-item"></div>
                    <div className="skeleton skeleton-detail-item"></div>
                    <div className="skeleton skeleton-detail-item"></div>
                </div>
                <div className="skeleton skeleton-line-long"></div>
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

export default ShipmentPostSkeleton;
