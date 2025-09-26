# Z-Index Conflicts Analysis

## Current Z-Index Usage Audit

### Identified Values

| Component                | Current Value | Recommended Value | Status                                    |
| ------------------------ | ------------- | ----------------- | ----------------------------------------- |
| App Shell Background     | 0             | 0                 | ✅ Correct                                |
| Decorative Elements      | 1             | 1                 | ✅ Correct                                |
| Glow Effects             | 2             | 2                 | ✅ Correct                                |
| Main Content             | 10            | 10                | ✅ Correct                                |
| Screen Control Bar       | 10            | 10                | ⚠️ Should be lower than panel control bar |
| Panel Control Bar        | 20            | 20                | ✅ Correct                                |
| Global Control Bar       | 20            | 20                | ✅ Correct                                |
| Workspace Zone B         | 20            | 20                | ✅ Correct                                |
| Drag Handles             | 50            | 50                | ✅ Correct                                |
| Tooltips                 | 50            | 50                | ⚠️ Conflict with other overlays           |
| Dropdowns                | 50            | 50                | ⚠️ Conflict with other overlays           |
| Sheets                   | 50            | 50                | ⚠️ Conflict with other overlays           |
| Modals/Dialogs           | 200           | 200               | ✅ Correct                                |
| Workspace Zone B Overlay | 100           | 100               | ✅ Correct                                |

### Conflicts Identified

1. **Screen Control Bar vs Panel Control Bar**

   - Both use z-10, but screen control bar should be lower
   - **Resolution**: Keep screen control bar at z-10, panel control bar at z-20

2. **Multiple Overlay Elements at z-50**

   - Tooltips, dropdowns, sheets, and drag handles all use z-50
   - **Resolution**: Stagger these values within the 40-59 range

3. **Inconsistent Modal Z-Index**
   - Some modals use z-50, others use z-[200]
   - **Resolution**: Standardize all modals to z-200

## Recommended Z-Index Hierarchy

### Background Layers (0-9)

- 0: App shell, background elements
- 1: Decorative elements
- 2: Glow effects

### Content Layers (10-19)

- 10: Main content, screen control bars
- 15: Sticky headers

### Control Layers (20-29)

- 20: Global control bar, panel control bars, workspace zone B
- 25: Bottom bar

### Interactive Layers (30-39)

- 30: Interactive elements, buttons, inputs
- 35: Form controls

### Overlay Layers (40-59)

- 40: Tooltips
- 45: Dropdown menus
- 50: Drag handles
- 55: Sheets, popovers

### Critical Overlays (60+)

- 60: Notifications, alerts
- 100: Workspace zone B overlay
- 200: Modals, dialogs

## Migration Plan

### Phase 1: Fix Critical Conflicts

1. Update screen control bar to use proper hierarchy
2. Stagger overlay z-index values
3. Standardize modal z-index values

### Phase 2: Refactor to Centralized System

1. Replace hardcoded values with ZIndex.layers
2. Update CSS to use custom properties
3. Add conflict detection

### Phase 3: Validation

1. Test all UI interactions
2. Verify layering is correct
3. Document any remaining issues

## Implementation Priority

### High Priority (Fix Immediately)

- Screen control bar z-index hierarchy
- Modal z-index standardization
- Overlay z-index staggering

### Medium Priority (Next Sprint)

- Refactor to centralized system
- Add CSS custom properties
- Update documentation

### Low Priority (Future)

- Add conflict detection tools
- Create migration utilities
- Performance optimizations
