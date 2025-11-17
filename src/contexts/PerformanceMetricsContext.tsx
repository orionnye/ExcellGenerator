import React, { createContext, useContext, ReactNode } from 'react';
import { usePerformanceMetrics, MetricData } from '../hooks/usePerformanceMetrics';

interface PerformanceMetricsContextType {
  structureDetection: MetricData;
  extraction: MetricData;
  excelGeneration: MetricData;
  trackStructureDetection: (duration: number) => void;
  trackExtraction: (duration: number) => void;
  trackExcelGeneration: (duration: number) => void;
  clearMetrics: () => void;
}

const PerformanceMetricsContext = createContext<PerformanceMetricsContextType | undefined>(undefined);

interface PerformanceMetricsProviderProps {
  children: ReactNode;
}

export const PerformanceMetricsProvider: React.FC<PerformanceMetricsProviderProps> = ({ children }) => {
  const metrics = usePerformanceMetrics();

  return (
    <PerformanceMetricsContext.Provider value={metrics}>
      {children}
    </PerformanceMetricsContext.Provider>
  );
};

export const usePerformanceMetricsContext = (): PerformanceMetricsContextType => {
  const context = useContext(PerformanceMetricsContext);
  if (!context) {
    throw new Error('usePerformanceMetricsContext must be used within PerformanceMetricsProvider');
  }
  return context;
};

