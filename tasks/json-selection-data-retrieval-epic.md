# JSON Selection Data Retrieval Epic

**Status**: ✅ COMPLETED (2025-11-16)  
**Goal**: Fix data retrieval from JSON selection to correctly handle nested object structures with wrapper properties, while refactoring extraction logic to be testable and maintainable

## Overview

Currently, selecting objects from JSON works for flat structures (e.g., `{ logId: 48899279832, activityName: "Walk", ... }`) but fails for objects wrapped in a container property (e.g., `{ dateTime: "...", value: { bpm: 65, confidence: 2 } }`). When users select the wrapper object, they need the nested `value` property extracted, not the entire wrapper object. Additionally, extraction logic is currently entangled with UI hooks, making future updates difficult. This epic will refactor the architecture to separate concerns, then implement wrapper object handling.

---

## Refactor Data Extraction Architecture

Extract pure data transformation functions from React hooks to improve testability and maintainability.

**Requirements**:
- Given extraction logic exists in hooks, should move it to pure utility functions in utils/
- Given multiple hooks duplicate extraction logic, should create unified `extractSelectedData` function
- Given extraction functions are pure, should be testable without React dependencies
- Given hooks need extraction results, should call pure functions rather than contain logic

---

## Create Unified Data Extraction Utility

Build a single source of truth for extracting data from selected paths.

**Requirements**:
- Given selected paths and JSON data, should return array of extracted values
- Given extraction utility exists, should be used by both useExcelGenerator and useIntermediateData hooks
- Given extraction fails, should return null or empty array consistently
- Given utility is pure function, should have no side effects or dependencies on React

---

## Discover Data Retrieval Behavior

Investigate how path selection and data extraction currently work for different JSON structures.

**Requirements**:
- Given a flat object structure is selected, should extract the entire object as-is
- Given a wrapper object with nested data property is selected, should identify the nested structure pattern
- Given path selection occurs, should understand what path was selected and what data was extracted

---

## Identify Wrapper Object Patterns

Determine wrapper object detection rules and extraction strategy.

**Requirements**:
- Given object has structure `{ dateTime: "...", value: { ... } }`, should detect "value" as wrapper property
- Given object has single nested object/array property, should identify it as potential wrapper pattern
- Given multiple wrapper patterns exist, should support common patterns (value, data, result, payload, etc.)
- Given wrapper detection is ambiguous, should fall back to extracting entire object

---

## Implement Wrapper Object Extraction

Add logic to automatically extract nested data from wrapper objects.

**Requirements**:
- Given selected object matches wrapper pattern, should extract nested property automatically
- Given wrapper extraction occurs, should preserve path context for proper Excel row mapping
- Given extraction fails or is ambiguous, should fall back to extracting entire selected object
- Given wrapper extraction is configurable, should support pattern customization

---

## Test Data Retrieval Fixes

Verify that both flat and wrapper object structures work correctly after refactoring.

**Requirements**:
- Given flat object structure is selected, should work as before (no regression)
- Given wrapper object with "value" property is selected, should extract nested value correctly
- Given wrapper object with other nested properties is selected, should handle appropriately
- Given extraction utility is pure function, should have comprehensive unit tests

