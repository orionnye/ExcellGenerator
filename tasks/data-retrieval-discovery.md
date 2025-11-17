# Data Retrieval Behavior Discovery

## Current Behavior Analysis

### Working Cases ✅

1. **Flat Objects**: Selecting path "0" on `{ logId: 48899279832, activityName: "Walk", ... }` works correctly
   - Extracts entire object as-is
   - Excel generation works properly

2. **Nested Path Selection**: Selecting path "0.value" on `{ dateTime: "...", value: { bpm: 65 } }` works correctly
   - Extracts nested value directly
   - User can manually select nested paths

### Problem Cases ❌

1. **Wrapper Objects**: Selecting path "0" on `{ dateTime: "...", value: { bpm: 65, confidence: 2 } }` fails
   - Extracts entire wrapper object including metadata (dateTime)
   - User wants just the nested `value` property
   - Excel includes unwanted columns (dateTime)

## Root Cause

Users are selecting the wrapper object path ("0") when they actually want the nested data property ("0.value"). The system correctly extracts what's selected, but users expect automatic unwrapping of wrapper objects.

## Solution Approach

Auto-detect wrapper patterns and extract nested data property when:
- Selected object has a single nested object/array property
- That property matches common wrapper patterns (value, data, result, payload)
- The wrapper object has other properties (metadata) alongside the data property

## Test Cases Documented

All test cases added to `dataExtractor.test.ts` to verify:
- Current behavior (wrapper extraction)
- Nested path selection (works)
- Flat object extraction (works)
- Edge cases (undefined values, mixed types)

