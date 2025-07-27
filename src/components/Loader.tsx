import React from 'react';

interface Props {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullscreen?: boolean;
}

const Loader: React.FC<Props> = ({
  size = 'medium',
  color = 'primary',
  text = 'Loading...',
  fullscreen = false,
}) => {
  const containerClass =
    `loader-container ${size} ${color} ${fullscreen ? 'fullscreen' : ''}`.trim();

  return (
    <div className={containerClass} role="status" aria-label={text}>
      <div className="loader-content">
        <div className="loader-spinner">
          <svg viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            />
          </svg>
        </div>
        {text && (
          <div className="loader-text" aria-live="polite">
            {text}
          </div>
        )}
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
};

export default Loader;
