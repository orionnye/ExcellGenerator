import React from 'react';
import { usePerformanceMetricsContext } from '../contexts/PerformanceMetricsContext';
import './PerformanceMetrics.css';

interface PerformanceMetricsProps {
  showAverages?: boolean;
}

/**
 * Gets color class based on performance threshold
 * < 50ms = green, 50-200ms = yellow, > 200ms = red
 */
const getPerformanceColor = (ms: number): string => {
  if (ms < 50) return 'perf-good';
  if (ms < 200) return 'perf-warning';
  return 'perf-slow';
};

/**
 * Formats time in milliseconds to readable string
 */
const formatTime = (ms: number): string => {
  if (ms < 1) return '<1ms';
  if (ms < 10) return `${ms.toFixed(1)}ms`;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  showAverages = false,
}) => {
  const metrics = usePerformanceMetricsContext();

  const renderMetric = (
    label: string,
    current: number,
    average: number,
    count: number
  ) => {
    const displayValue = showAverages && count > 0 ? average : current;
    const colorClass = getPerformanceColor(displayValue);
    const tooltip = showAverages
      ? `${label}: Current ${formatTime(current)}, Average ${formatTime(average)} (${count} samples)`
      : `${label}: ${formatTime(current)} (${count} samples, Avg: ${formatTime(average)})`;

    return (
      <div key={label} className="perf-metric" title={tooltip}>
        <span className="perf-label">{label}:</span>
        <span className={`perf-value ${colorClass}`}>
          {formatTime(displayValue)}
        </span>
      </div>
    );
  };

  return (
    <div className="performance-metrics">
      <div className="perf-metrics-icon" title="Performance Metrics">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2L2 6v8h12V6L8 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M8 6v6M5 8h6"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>
      <div className="perf-metrics-content">
        {renderMetric(
          'Struct',
          metrics.structureDetection.current,
          metrics.structureDetection.average,
          metrics.structureDetection.count
        )}
        {renderMetric(
          'Extract',
          metrics.extraction.current,
          metrics.extraction.average,
          metrics.extraction.count
        )}
        {renderMetric(
          'Excel',
          metrics.excelGeneration.current,
          metrics.excelGeneration.average,
          metrics.excelGeneration.count
        )}
      </div>
    </div>
  );
};

export default PerformanceMetrics;

