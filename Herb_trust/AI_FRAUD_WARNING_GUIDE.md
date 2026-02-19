# AI Fraud Warning Feature Guide

## Overview

The AI Fraud Warning feature provides visual alerts when batches show suspicious patterns based on authenticity scores. When the AI-determined authenticity score falls below 60%, the system displays prominent warning indicators to alert users.

## Components

### FraudWarning Component

Located at: `frontend/src/components/FraudWarning.tsx`

A reusable React component that displays fraud alerts in two variants:

#### Props

```typescript
interface FraudWarningProps {
  authenticityScore: number | null;
  variant?: 'default' | 'compact';
}
```

- **authenticityScore**: The AI-determined authenticity score (0-100)
- **variant**: Display variant
  - `'default'`: Full alert with detailed information (for detail pages)
  - `'compact'`: Inline badge with tooltip (for table rows)

#### Behavior

- Returns `null` if `authenticityScore >= 60` or `authenticityScore === null`
- Shows alert only when score is below 60%
- Includes subtle pulse animation for attention
- Displays tooltip on hover (compact variant)

#### Variants

**Default Variant** (Full Alert):
```tsx
<FraudWarning authenticityScore={batch.authenticity_score} />
```
- Displays as a full Alert component
- Shows "Suspicious Batch Detected" title
- Displays authenticity score percentage
- Includes detailed warning message
- Red background (bg-destructive/15)
- AlertTriangle icon

**Compact Variant** (Inline Badge):
```tsx
<FraudWarning authenticityScore={batch.authenticity_score} variant="compact" />
```
- Displays as a small inline badge
- Shows "AI Fraud Alert" text
- Includes tooltip: "AI detected abnormal patterns in this batch"
- Red background (bg-destructive/20)
- Minimal space usage for tables

## Integration Examples

### In Tables (Auditor/Manufacturer Pages)

```tsx
<TableCell>
  <div className="space-y-1">
    {batch.authenticity_score !== null ? (
      <span className={`font-semibold ${/* color classes */}`}>
        {batch.authenticity_score.toFixed(1)}%
      </span>
    ) : '-'}
    {batch.authenticity_score !== null && batch.authenticity_score < 60 && (
      <div className="mt-1">
        <FraudWarning 
          authenticityScore={batch.authenticity_score} 
          variant="compact" 
        />
      </div>
    )}
  </div>
</TableCell>
```

### In Detail Views/Dialogs

```tsx
<div className="p-4 rounded-lg bg-muted/40 border border-border">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-muted-foreground">AI Score</span>
    <span className="text-2xl font-bold">
      {batch.authenticity_score?.toFixed(1)}%
    </span>
  </div>
  <Progress value={batch.authenticity_score || 0} className="h-3" />
  {batch.authenticity_score !== null && batch.authenticity_score < 60 && (
    <div className="mt-3">
      <FraudWarning authenticityScore={batch.authenticity_score} />
    </div>
  )}
</div>
```

## Current Integrations

### 1. Auditor Dashboard
**File**: `frontend/src/pages/AuditorDashboard.tsx`

- **Location**: AI Score column in batches table
- **Variant**: Compact (inline badge)
- **Trigger**: Shows when `batch.authenticity_score < 60`

### 2. Auditor History
**File**: `frontend/src/pages/AuditorHistory.tsx`

- **Location**: AI Score column in history table
- **Variant**: Compact (inline badge)
- **Trigger**: Shows when `batch.authenticity_score < 60`

### 3. Manufacturer Incoming
**File**: `frontend/src/pages/ManufacturerIncoming.tsx`

- **Locations**:
  1. AI Score column in batches table (compact variant)
  2. Batch detail dialog (default variant)
- **Trigger**: Shows when `batch.authenticity_score < 60`

## Translation Keys

The component uses the following i18n keys (defined in `frontend/src/i18n/`):

```json
{
  "fraudWarning": {
    "title": "Suspicious Batch Detected",
    "authenticityScore": "Authenticity Score",
    "tooltip": "AI detected abnormal patterns in this batch",
    "lowScore": "Low authenticity score detected",
    "aiAlert": "AI Fraud Alert"
  }
}
```

Currently supported languages:
- **English** (`en.json`)
- **Hindi** (`hi.json`) - संदिग्ध बैच का पता चला
- **Tamil** (`ta.json`) - சந்தேகத்திற்குரிய தொகுதி கண்டறியப்பட்டது
- **Telugu** (`te.json`) - అనుమానాస్పద బ్యాచ్ గుర్తించబడింది

## Threshold Logic

The fraud warning threshold is hardcoded to **60%**:

```tsx
if (!authenticityScore || authenticityScore >= 60) {
  return null;
}
```

**Rationale**:
- Scores **≥ 60%**: No warning (considered acceptable)
- Scores **< 60%**: Show warning (suspicious patterns detected)

This threshold can be adjusted based on:
- Historical fraud data analysis
- False positive/negative rates
- Business requirements

## Styling

The component uses Tailwind CSS classes for styling:

**Default Variant**:
- Background: `bg-destructive/15`
- Border: `border-destructive`
- Icon color: `text-destructive`
- Animation: `animate-pulse-subtle`

**Compact Variant**:
- Background: `bg-destructive/20`
- Text: `text-destructive`
- Hover: Tooltip display
- Animation: `animate-pulse-subtle`

Custom animation defined in `frontend/tailwind.config.ts`:
```typescript
'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
```

## Dependencies

Required UI components from shadcn/ui:
- `Alert` and `AlertDescription` (default variant)
- `Badge` (compact variant)
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` (compact variant)

Icons:
- `AlertTriangle` from `lucide-react`

## Usage Best Practices

1. **Always check for null**: Verify `authenticity_score !== null` before showing warnings
2. **Choose appropriate variant**: 
   - Use `compact` for table rows to save space
   - Use `default` for detail views with more context
3. **Maintain consistent threshold**: Keep the 60% threshold consistent across all pages
4. **Consider user role**: Different user roles may need different warning displays
5. **Accessibility**: The component includes proper ARIA labels and tooltips

## Future Enhancements

Potential improvements:
- Configurable threshold via environment variables
- Different warning levels (low/medium/high)
- Detailed fraud pattern explanations
- Historical fraud trend charts
- Admin-configurable thresholds per herb type

## Testing

To test the fraud warning feature:

1. **Create a batch with low score**:
   - Ensure batch has `authenticity_score < 60`
   
2. **Verify display**:
   - Check Auditor Dashboard table
   - Check Auditor History table
   - Check Manufacturer Incoming table and detail dialog

3. **Test threshold boundary**:
   - Score = 59.9 → Should show warning
   - Score = 60.0 → Should NOT show warning
   
4. **Test null handling**:
   - Score = null → Should NOT show warning

5. **Test translations**:
   - Switch language in UI
   - Verify translated warning text appears

## Troubleshooting

**Warning not appearing**:
- Verify `authenticity_score < 60`
- Check that `authenticity_score` is not `null`
- Ensure `FraudWarning` component is imported
- Check browser console for errors

**Translation not working**:
- Verify language files include `fraudWarning` section
- Check that `useTranslation` hook is properly initialized
- Ensure i18n is configured correctly

**Styling issues**:
- Verify Tailwind CSS is processing the component
- Check that `animate-pulse-subtle` is defined in tailwind config
- Ensure shadcn/ui components are properly installed
