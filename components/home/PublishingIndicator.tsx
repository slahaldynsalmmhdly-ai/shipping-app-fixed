import React, { useState, useEffect } from 'react';
import './PublishingIndicator.css';
import type { PublishingType } from '../../App';

interface PublishingIndicatorProps {
  status: 'publishing' | 'success';
  onComplete: () => void;
  type: PublishingType;
}

const PublishingIndicator: React.FC<PublishingIndicatorProps> = ({ status, onComplete, type }) => {
  const [phase, setPhase] = useState<'showing' | 'hiding'>('showing');

  useEffect(() => {
    // When the status becomes 'success', immediately call onComplete.
    // This causes the parent to unmount this component, effectively hiding it
    // without ever showing a success state.
    if (status === 'success') {
      onComplete();
    }
  }, [status, onComplete]);

  const isAd = type === 'ad';
  const itemTypeYour = isAd ? 'إعلانك' : 'منشورك';


  // This component will now only render in its 'publishing' state.
  return (
    <div className={`publishing-indicator-container ${phase}`}>
        <div className="publishing-indicator-content">
            <div className="publishing-indicator-text">
                <h4>{`جاري نشر ${itemTypeYour}...`}</h4>
                <p>{'سيظهر في آخر الأخبار قريباً.'}</p>
            </div>
        </div>
        <div className="publishing-indicator-loader">
            <div className="progress-bar-indeterminate"></div>
        </div>
    </div>
  );
};

export default PublishingIndicator;
