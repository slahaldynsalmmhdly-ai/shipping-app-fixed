import React from 'react';
import './StoryCard.css';

// A new local component for displaying a small star rating.
const SmallStarRating: React.FC<{ rating: number }> = ({ rating }) => {
    // Fills stars based on the rating value. Shows empty stars if rating is 0.
    return (
        <div className="story-star-rating">
            {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24">
                    <path d="m5.825 21 2.325-7.6-5.6-5.45 7.625-1.125L12 0l2.825 6.825 7.625 1.125-5.6 5.45L19.175 21 12 17.275Z" fill={i < rating ? '#f1c40f' : 'rgba(255,255,255,0.4)'} />
                </svg>
            ))}
        </div>
    );
};


interface StoryCardProps {
    isViewMore?: boolean;
    avatarUrl?: string;
    coverImageUrl?: string;
    name: string;
    rating?: number;
    onOpenProfile?: () => void;
    onOpenChat?: () => void;
    onClick?: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ isViewMore = false, avatarUrl, coverImageUrl, name, rating = 0, onOpenProfile, onOpenChat, onClick }) => {

    const cardStyle = coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : {};

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent onOpenProfile from firing
        if (onOpenChat) {
            onOpenChat();
        }
    };
    
    // The "View More" card has a different structure and is disabled.
    if (isViewMore) {
        return (
            <div className={`story-card`} role="button" tabIndex={0} aria-label={name} onClick={onClick}>
                <div className="story-card-overlay"></div>
                <div className="story-content view-more-content">
                    <div className="add-story-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>
                    <p className="story-name">{name}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`story-card`} style={cardStyle} role="button" tabIndex={0} aria-label={name} onClick={onOpenProfile}>
            <div className="story-card-overlay"></div>
            <div className="story-content">
                <div className="story-avatar-wrapper">
                    <img src={avatarUrl} alt={`${name}'s story`} className="story-avatar" />
                </div>
                <SmallStarRating rating={rating} />
                <p className="story-name">{name}</p>
                 <button className="story-chat-icon" onClick={handleChatClick} aria-label={`مراسلة ${name}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default StoryCard;