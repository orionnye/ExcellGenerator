import React, { useState, useEffect, useMemo } from 'react';
import { useFileData } from '../contexts/FileDataContext';
import { getMemoryInfo } from '../utils/browserStorageMetrics';
import { formatFileSize, formatPercentage } from '../utils/fileSizeFormatter';
import { estimateMemoryUsage } from '../utils/appMemoryCalculator';
import './MemoryDisplay.css';

export const MemoryDisplay: React.FC = () => {
  const { state } = useFileData();
  const [memoryInfo, setMemoryInfo] = useState<{
    heapLimit: number;
    usedHeap: number;
  } | null>(null);

  // Calculate app memory usage
  const appMemory = useMemo(() => {
    return estimateMemoryUsage(state.fileContent, state.parsedJsonData, state.excelData);
  }, [state.fileContent, state.parsedJsonData, state.excelData]);

  // Map process state to status text - only show ACTIVE processes
  const processStatus = useMemo(() => {
    switch (state.processState) {
      case 'idle':
        return 'Idle';
      case 'scanning':
        return 'Scanning folder...';
      case 'filesLoaded':
        return 'Ready - Select a file';
      case 'loadingFile':
        return 'Loading file...';
      case 'fileLoaded':
        return 'Ready - Parse JSON';
      case 'parsingJson':
        return 'Parsing JSON...';
      case 'jsonParsed':
        return 'Ready - Generate Excel';
      case 'generatingExcel':
        return 'Generating Excel preview...';
      case 'ready':
        return 'Ready';
      case 'error':
        return `Error: ${state.processError || 'Unknown error'}`;
      default:
        return 'Unknown';
    }
  }, [state.processState, state.processError]);

  useEffect(() => {
    const updateMemoryInfo = () => {
      const memory = getMemoryInfo();
      if (memory) {
        setMemoryInfo({
          heapLimit: memory.jsHeapSizeLimit,
          usedHeap: memory.usedJSHeapSize,
        });
      } else {
        setMemoryInfo(null);
      }
    };

    updateMemoryInfo();
    // Update periodically
    const interval = setInterval(updateMemoryInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!memoryInfo) {
    return null;
  }

  const totalMemory = memoryInfo.heapLimit;
  const usedMemory = memoryInfo.usedHeap;
  const appMemoryPercent = totalMemory > 0 ? (appMemory.total / totalMemory) * 100 : 0;
  const usedMemoryPercent = totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0;

  return (
    <div className="memory-display">
      <div className="memory-info">
        <span className="memory-label">Total Memory:</span>
        <span className="memory-value">{formatFileSize(totalMemory)}</span>
      </div>
      <div className="memory-bar-container">
        <div className="memory-bar">
          <div 
            className="memory-bar-used"
            style={{ width: `${Math.min(usedMemoryPercent, 100)}%` }}
            title={`Browser Used: ${formatFileSize(usedMemory)} (${formatPercentage(usedMemory, totalMemory)})`}
          >
            {appMemory.total > 0 && usedMemory > 0 && (
              <div 
                className="memory-bar-app"
                style={{ 
                  width: `${Math.min((appMemory.total / usedMemory) * 100, 100)}%`,
                }}
                title={`App Memory: ${formatFileSize(appMemory.total)} (${formatPercentage(appMemory.total, totalMemory)})`}
              />
            )}
          </div>
        </div>
        <div className="memory-bar-labels">
          <span className="memory-bar-label">
            Used: {formatFileSize(usedMemory)}
          </span>
          {appMemory.total > 0 && (
            <span className="memory-bar-label memory-bar-label-app">
              App: {formatFileSize(appMemory.total)}
            </span>
          )}
        </div>
      </div>
      <div className="process-status">
        <span className="process-status-label">Status:</span>
        <span className="process-status-value">{processStatus}</span>
      </div>
    </div>
  );
};

