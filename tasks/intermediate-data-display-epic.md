# Intermediate Data Display Epic

**Status**: 📋 PLANNED  
**Goal**: Display the intermediate data state between JSON selection and Excel transformation to help users understand what data will be exported

## Overview

Users currently see raw JSON objects when toggling "Show Selected Objects" and then see a flattened Excel table, but there's no clear view of the intermediate state - the extracted selected values before they're flattened into Excel rows. This gap makes it difficult to understand how selected objects transform into Excel columns and rows. Displaying this intermediate state will help users verify their selections and understand the transformation process before exporting.

---

## Create Intermediate Data State Hook

Extract and structure selected object values into a displayable intermediate format.

**Requirements**:
- Given selected object paths are extracted, should structure them as an array of objects ready for Excel transformation
- Given multiple selected objects, should preserve their individual structure before flattening
- Given the intermediate state exists, should expose it through a reusable hook

---

## Build Intermediate Data Display Component

Create a component that visualizes the intermediate data state in a structured format.

**Requirements**:
- Given intermediate data is available, should display it in a table-like structure showing objects as rows
- Given nested objects exist in intermediate data, should show them in an expandable/collapsible format
- Given users want to understand the transformation, should visually indicate how objects map to Excel rows

---

## Integrate Intermediate View into Excel Preview

Add the intermediate data view as a third view option alongside "Selected Objects" and "Excel Table".

**Requirements**:
- Given users want to see intermediate state, should provide a toggle/view option to display it
- Given intermediate view is active, should show structured data that bridges JSON and Excel formats
- Given users switch between views, should maintain consistent state and selection context

---

## Style Intermediate Data Display

Apply styling to make the intermediate data view clear and visually distinct from other views.

**Requirements**:
- Given intermediate data is displayed, should use visual hierarchy to distinguish it from raw JSON and Excel views
- Given nested structures exist, should use indentation or tree-like visualization to show relationships
- Given the view helps users understand transformation, should highlight how objects will map to Excel columns

