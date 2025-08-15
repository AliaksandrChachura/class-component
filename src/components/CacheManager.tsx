import React, { useState, useEffect, useRef } from 'react';
import { useCharacterCache } from '../hooks/useCharacterCache';

const CacheManager: React.FC = () => {
  const { getCacheStats, clearAllCache, clearExpiredCache } =
    useCharacterCache();
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    validEntries: 0,
    expiredEntries: 0,
    cacheSize: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const getCacheStatsRef = useRef(getCacheStats);

  // Update ref when function changes
  useEffect(() => {
    getCacheStatsRef.current = getCacheStats;
  }, [getCacheStats]);

  useEffect(() => {
    setMounted(true);
    setCacheStats(getCacheStatsRef.current());
  }, []); // Only run once on mount

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCacheStats(getCacheStatsRef.current());
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted]); // Only depend on mounted state

  const handleClearAllCache = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all cached character data?'
      )
    ) {
      clearAllCache();
      setCacheStats(getCacheStatsRef.current());
    }
  };

  const handleClearExpiredCache = () => {
    clearExpiredCache();
    setCacheStats(getCacheStatsRef.current());
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className="cache-manager-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title="Cache Manager"
      >
        💾 {mounted ? cacheStats.validEntries : '0'}
      </button>

      {/* Cache manager panel */}
      {isVisible && (
        <div className="cache-manager-panel">
          <div className="cache-manager-header">
            <h3>Character Cache Manager</h3>
            <button
              className="close-btn"
              onClick={() => setIsVisible(false)}
              aria-label="Close cache manager"
            >
              ×
            </button>
          </div>

          <div className="cache-stats">
            <div className="stat-item">
              <span className="stat-label">Total Entries:</span>
              <span className="stat-value">{cacheStats.totalEntries}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Valid Entries:</span>
              <span className="stat-value valid">
                {cacheStats.validEntries}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Expired Entries:</span>
              <span className="stat-value expired">
                {cacheStats.expiredEntries}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cache Size:</span>
              <span className="stat-value">{cacheStats.cacheSize}</span>
            </div>
          </div>

          <div className="cache-actions">
            <button
              className="action-btn clear-expired"
              onClick={handleClearExpiredCache}
              disabled={cacheStats.expiredEntries === 0}
            >
              Clear Expired
            </button>
            <button
              className="action-btn clear-all"
              onClick={handleClearAllCache}
              disabled={cacheStats.totalEntries === 0}
            >
              Clear All
            </button>
          </div>

          <div className="cache-info">
            <p>
              Character details are cached for 24 hours to improve performance.
              Expired entries are automatically cleaned up.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CacheManager;
