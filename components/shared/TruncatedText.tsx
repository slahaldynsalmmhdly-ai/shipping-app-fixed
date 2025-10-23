import React, { useState } from 'react';
import './TruncatedText.css';

interface TruncatedTextProps {
  text: string;
  charLimit?: number;
  className?: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, charLimit = 200, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't truncate if text is null, undefined, or shorter than the limit.
  if (!text || text.length <= charLimit) {
    return <p className={className}>{text}</p>;
  }

  const truncated = text.substring(0, charLimit);

  return (
    <p className={className}>
      {isExpanded ? text : (
        <>
          {`${truncated}... `}
          <button onClick={() => setIsExpanded(true)} className="read-more-btn">
            عرض المزيد
          </button>
        </>
      )}
    </p>
  );
};

export default TruncatedText;
