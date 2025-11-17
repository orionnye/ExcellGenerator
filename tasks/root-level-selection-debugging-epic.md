# Root-Level Selection Debugging & Logging Epic

**Status**: 📋 PLANNED  
**Goal**: Create robust logging and debugging tools to diagnose and understand root-level array item selection issues

## Overview

Root-level array item selection can fail silently when structure detection or path matching doesn't work as expected. Currently, there's no visibility into what's happening during the selection process. This epic will add comprehensive logging and debugging tools to help diagnose issues with root-level item selection, making it easier to understand why selections might not be working.

---

## Understand Root-Level Selection Flow

Map out the complete flow of root-level selection from user click to data extraction.

**Requirements**:
- Given a user clicks on a root-level array item, should document the complete flow
- Given structure detection occurs, should understand when and how paths are detected
- Given path matching happens, should understand how paths are matched to structurePaths
- Given selection occurs, should understand how paths are added to selectedPaths
- Given extraction happens, should understand how selected paths are used

**Acceptance Criteria**:
- Flow diagram or documentation created showing the complete selection flow
- Key decision points identified (structure detection, path matching, selection, extraction)
- Edge cases documented (missing pathInfo, empty structure, etc.)

---

## Create Debug Logging Utility

Build a centralized debug logging utility that can be toggled on/off.

**Requirements**:
- Given debug mode is enabled, should log all selection-related events
- Given debug mode is disabled, should have zero performance impact
- Given logging occurs, should include relevant context (path, pathInfo, structure, etc.)
- Given errors occur, should log error details with context
- Given logging utility exists, should be reusable across components

**Acceptance Criteria**:
- Debug utility created in `src/utils/debugLogger.ts`
- Can be enabled via environment variable or config
- Logs include timestamps and context
- Performance impact is negligible when disabled
- Logs are formatted for easy reading

---

## Add Selection Flow Logging

Add comprehensive logging throughout the selection flow.

**Requirements**:
- Given structure detection runs, should log detected paths and structures
- Given user clicks on an item, should log click event with path and pathInfo
- Given handleSelectionClick is called, should log the decision logic
- Given path matching occurs, should log matched paths
- Given selection is toggled, should log before/after state
- Given extraction happens, should log extracted data summary

**Acceptance Criteria**:
- Logging added to `detectStructuresWithPaths` (optional, when debug enabled)
- Logging added to `handleSelectionClick` in JsonSelectionOverlay
- Logging added to `onObjectClick` handler in FileViewer
- Logging added to `extractSelectedData` (optional, when debug enabled)
- All logs include relevant context (paths, structures, data summaries)

---

## Create Selection Debug Panel

Build a UI component to display selection state and debug information.

**Requirements**:
- Given debug panel exists, should show current selection state
- Given debug panel exists, should show detected structure paths
- Given debug panel exists, should show recent selection events
- Given debug panel exists, should be toggleable (show/hide)
- Given debug panel exists, should not interfere with normal UI

**Acceptance Criteria**:
- Debug panel component created in `src/components/SelectionDebugPanel.tsx`
- Shows selected paths, structure paths, recent events
- Can be toggled via keyboard shortcut or button
- Styled to not interfere with main UI
- Only visible in development mode or when explicitly enabled

---

## Add Performance Logging

Track performance metrics for selection operations.

**Requirements**:
- Given structure detection runs, should log duration
- Given selection click occurs, should log click-to-selection duration
- Given extraction happens, should log extraction duration
- Given performance logging exists, should identify slow operations
- Given performance issues occur, should help identify bottlenecks

**Acceptance Criteria**:
- Performance logging added to key operations
- Metrics logged: structure detection time, selection time, extraction time
- Slow operations (>100ms) are highlighted in logs
- Performance data can be exported or summarized

---

## Technical Notes

- Use `console.group` and `console.groupEnd` for structured logging
- Use `performance.now()` for timing measurements
- Consider using a logging library if needs grow (e.g., `debug` package)
- Debug panel should use React DevTools-like styling
- All logging should be conditional on `process.env.NODE_ENV === 'development'` or a config flag
- Consider adding a keyboard shortcut (e.g., `Ctrl+Shift+D`) to toggle debug panel
- Logs should be color-coded for different event types (info, warning, error)

---

## Future Enhancements

- Export logs to file for analysis
- Visual flow diagram showing selection path
- Replay selection events
- Breakpoint-style debugging for selection flow

