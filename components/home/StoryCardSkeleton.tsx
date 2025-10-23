import React from 'react';
import './StoryCardSkeleton.css';

const StoryCardSkeleton: React.FC = () => {
    return (
        <div className="story-card-skeleton">
            <div className="story-content-skeleton">
                <div className="skeleton skeleton-story-avatar"></div>
                <div className="skeleton skeleton-story-stars"></div>
                <div className="skeleton skeleton-story-name"></div>
                <div className="skeleton skeleton-story-chat-icon"></div>
            </div>
        </div>
    );
};

export default StoryCardSkeleton;
