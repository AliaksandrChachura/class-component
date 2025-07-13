import React from 'react';

interface Props {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullscreen?: boolean;
}

export default class Loader extends React.Component<Props> {
  static defaultProps: Props = {
    size: 'medium',
    variant: 'spinner',
    color: 'primary',
    text: 'Loading...',
    fullscreen: false,
  };

  renderSpinner() {
    const { variant } = this.props;

    switch (variant) {
      case 'dots':
        return (
          <div className="loader-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="loader-pulse">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        );

      case 'bars':
        return (
          <div className="loader-bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        );

      default: // spinner
        return (
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
        );
    }
  }

  render() {
    const { size, color, text, fullscreen } = this.props;

    const containerClass =
      `loader-container ${size} ${color} ${fullscreen ? 'fullscreen' : ''}`.trim();

    return (
      <div className={containerClass} role="status" aria-label={text}>
        <div className="loader-content">
          {this.renderSpinner()}
          {text && (
            <div className="loader-text" aria-live="polite">
              {text}
            </div>
          )}
        </div>
        <span className="sr-only">{text}</span>
      </div>
    );
  }
}
