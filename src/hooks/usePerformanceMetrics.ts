import { useState, useCallback } from 'react';

export interface MetricData {
  current: number; // Most recent operation time in ms
  average: number; // Rolling average of last 10 operations
  count: number; // Number of operations tracked
}

interface PerformanceMetrics {
  structureDetection: MetricData;
  extraction: MetricData;
  excelGeneration: MetricData;
}

const MAX_SAMPLES = 10;

/**
 * Hook to track and aggregate performance metrics from key operations
 * Maintains rolling averages of the last 10 operations for each metric type
 */
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    structureDetection: { current: 0, average: 0, count: 0 },
    extraction: { current: 0, average: 0, count: 0 },
    excelGeneration: { current: 0, average: 0, count: 0 },
  });

  // Store samples for rolling average calculation
  const [samples, setSamples] = useState<{
    structureDetection: number[];
    extraction: number[];
    excelGeneration: number[];
  }>({
    structureDetection: [],
    extraction: [],
    excelGeneration: [],
  });

  const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };

  const updateMetric = useCallback(
    (
      metricType: 'structureDetection' | 'extraction' | 'excelGeneration',
      duration: number
    ) => {
      setSamples((prev) => {
        const newSamples = [...prev[metricType], duration].slice(-MAX_SAMPLES);
        const average = calculateAverage(newSamples);

        setMetrics((prevMetrics) => ({
          ...prevMetrics,
          [metricType]: {
            current: duration,
            average,
            count: newSamples.length,
          },
        }));

        return {
          ...prev,
          [metricType]: newSamples,
        };
      });
    },
    []
  );

  const trackStructureDetection = useCallback(
    (duration: number) => {
      updateMetric('structureDetection', duration);
    },
    [updateMetric]
  );

  const trackExtraction = useCallback(
    (duration: number) => {
      updateMetric('extraction', duration);
    },
    [updateMetric]
  );

  const trackExcelGeneration = useCallback(
    (duration: number) => {
      updateMetric('excelGeneration', duration);
    },
    [updateMetric]
  );

  const clearMetrics = useCallback(() => {
    setMetrics({
      structureDetection: { current: 0, average: 0, count: 0 },
      extraction: { current: 0, average: 0, count: 0 },
      excelGeneration: { current: 0, average: 0, count: 0 },
    });
    setSamples({
      structureDetection: [],
      extraction: [],
      excelGeneration: [],
    });
  }, []);

  return {
    structureDetection: metrics.structureDetection,
    extraction: metrics.extraction,
    excelGeneration: metrics.excelGeneration,
    trackStructureDetection,
    trackExtraction,
    trackExcelGeneration,
    clearMetrics,
  };
};

