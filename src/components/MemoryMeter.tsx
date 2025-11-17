import React, { useState, useEffect } from 'react';
import './MemoryMeter.css';

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

const MemoryMeter: React.FC = () => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);

  useEffect(() => {
    const getMemoryInfo = (): MemoryInfo | null => {
      // Check if performance.memory is available (Chrome-based browsers)
      if (performance && (performance as any).memory) {
        const mem = (performance as any).memory;
        return {
          jsHeapSizeLimit: mem.jsHeapSizeLimit,
          totalJSHeapSize: mem.totalJSHeapSize,
          usedJSHeapSize: mem.usedJSHeapSize,
        };
      }
      return null;
    };

    // Initial check
    setMemoryInfo(getMemoryInfo());

    // Update memory info every second
    const interval = setInterval(() => {
      setMemoryInfo(getMemoryInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatMemory = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(1)}GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)}MB`;
  };

  // Use actual memory data if available, otherwise show unavailable
  const totalMemory = memoryInfo?.jsHeapSizeLimit ?? 0;
  const usedMemory = memoryInfo?.usedJSHeapSize ?? 0;
  const percentageUsed = totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0;

  if (!memoryInfo) {
    return (
      <div className="memory-meter">
        <div className="memory-meter-icon" title="Memory Usage">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12v8H2V4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M4 6h8M4 8h6M4 10h8" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>
        <div className="memory-meter-info">
          <span className="memory-used">N/A</span>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-meter">
      <div className="memory-meter-icon" title="Memory Usage">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12v8H2V4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M4 6h8M4 8h6M4 10h8" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>
      <div className="memory-meter-info">
        <span className="memory-used">{formatMemory(usedMemory)}</span>
        <span className="memory-separator">/</span>
        <span className="memory-total">{formatMemory(totalMemory)}</span>
      </div>
      <div className="memory-meter-bar">
        <div 
          className="memory-bar-fill"
          style={{ width: `${percentageUsed}%` }}
        />
      </div>
    </div>
  );
};

export default MemoryMeter;

