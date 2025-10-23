import React from 'react';
import './CommentSkeleton.css';

const CommentSkeletonItem: React.FC = () => (
    <div className="comment-skeleton-item">
        <div className="skeleton skeleton-avatar"></div>
        <div className="skeleton-content">
            <div className="skeleton skeleton-line" style={{ width: '40%' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '90%', marginTop: '8px' }}></div>
            <div className="skeleton skeleton-line" style={{ width: '70%' }}></div>
        </div>
    </div>
);

const CommentSkeleton: React.FC = () => {
    return (
        <div className="comment-skeleton-container">
            <CommentSkeletonItem />
            <CommentSkeletonItem />
            <CommentSkeletonItem />
            <CommentSkeletonItem />
        </div>
    );
};

export default CommentSkeleton;
