# Performance Metrics Display Epic

**Status**: ✅ COMPLETED (2025-11-16)  
**Goal**: Display real-time performance metrics alongside the memory meter in the application header

## Overview

The application currently displays memory usage in the header via the MemoryMeter component. Users would benefit from seeing real-time performance metrics (structure detection time, extraction time, Excel generation time) displayed alongside the memory meter. This will help users understand the performance impact of their operations and identify when operations are taking longer than expected.

---

## Create Performance Metrics Hook

Build a hook to track and aggregate performance metrics from key operations.

**Requirements**:
- Given operations occur (structure detection, extraction, Excel generation), should track their duration
- Given metrics are tracked, should maintain a rolling average of recent operations
- Given metrics exist, should expose them through a React hook
- Given hook exists, should be lightweight and not impact performance
- Given operations complete, should update metrics in real-time

**Acceptance Criteria**:
- Hook created in `src/hooks/usePerformanceMetrics.ts`
- Tracks: structure detection time, extraction time, Excel generation time
- Maintains rolling averages (last 10 operations)
- Exposes current metrics and averages
- Zero performance overhead when not actively tracking

---

## Create Performance Metrics Component

Build a component to display performance metrics in a compact format.

**Requirements**:
- Given metrics component exists, should display key performance metrics
- Given metrics component exists, should match MemoryMeter styling
- Given metrics component exists, should show current operation time and averages
- Given metrics component exists, should be compact and fit in header
- Given metrics component exists, should show color-coded indicators (green/yellow/red)

**Acceptance Criteria**:
- Component created in `src/components/PerformanceMetrics.tsx`
- Displays: structure detection, extraction, Excel generation times
- Shows current and average times
- Color-coded based on performance thresholds
- Styled to match MemoryMeter appearance
- Responsive and compact

---

## Integrate Performance Tracking

Add performance tracking to key operations throughout the application.

**Requirements**:
- Given structure detection runs, should track and report duration
- Given data extraction occurs, should track and report duration
- Given Excel generation happens, should track and report duration
- Given tracking is added, should not break existing functionality
- Given tracking is added, should have minimal performance impact

**Acceptance Criteria**:
- Performance tracking added to `detectStructuresWithPaths`
- Performance tracking added to `extractSelectedData`
- Performance tracking added to `generateExcelFromJsonData`
- All tracking uses `performance.now()` for accuracy
- Metrics are reported to the performance hook
- No regressions in existing functionality

---

## Add Performance Metrics to Header

Integrate the PerformanceMetrics component into the application header.

**Requirements**:
- Given header exists, should display PerformanceMetrics alongside MemoryMeter
- Given metrics are displayed, should be visually consistent with MemoryMeter
- Given header is responsive, should handle metrics display gracefully
- Given metrics are optional, should be toggleable (show/hide)

**Acceptance Criteria**:
- PerformanceMetrics added to App.tsx header
- Positioned next to MemoryMeter
- Styled consistently with existing header elements
- Responsive layout maintained
- Optional: keyboard shortcut to toggle visibility

---

## Add Performance Thresholds and Warnings

Implement visual indicators when performance degrades.

**Requirements**:
- Given operation takes longer than threshold, should show warning indicator
- Given thresholds exist, should be configurable
- Given warnings appear, should be visually distinct but not intrusive
- Given performance is good, should show positive indicator

**Acceptance Criteria**:
- Performance thresholds defined (e.g., < 50ms = green, 50-200ms = yellow, > 200ms = red)
- Color-coded indicators in PerformanceMetrics component
- Tooltips show detailed timing information
- Warnings are subtle and informative

---

## Technical Notes

- Use `performance.now()` for high-resolution timing
- Maintain rolling averages using a circular buffer or array
- Consider using a context provider for performance metrics to share across components
- Metrics should reset or clear when new file is loaded
- Consider adding a "Clear Metrics" button or automatic reset
- Performance tracking should be opt-in or development-mode only to avoid production overhead
- Use React.memo to prevent unnecessary re-renders of metrics display

---

## Future Enhancements

- Export performance metrics to file
- Performance history graph
- Compare metrics across different operations
- Performance profiling mode
- Integration with browser DevTools Performance API

