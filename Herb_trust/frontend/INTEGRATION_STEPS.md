# 📝 Step-by-Step Integration into Existing App

Your app already uses `BrowserRouter` with `Routes` and `Route`. Here's how to add the new batch components.

---

## Quick Test: Add Demo Route (No Auth Required)

### Step 1: Open `src/App.tsx`

### Step 2: Add this import at the top:
```tsx
import BatchDemo from "./pages/BatchDemo";
```

### Step 3: Add this route inside `<Routes>` (after the `/auth` route):
```tsx
<Route path="/demo" element={<BatchDemo />} />
```

### Step 4: Test it
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/demo`
3. Test the form submission

---

## Full Integration: Replace Farmer Pages

### Step 1: Update Imports in `src/App.tsx`

Find the existing imports and add these new ones:

```tsx
// Add these imports after the existing page imports
import BatchDemo from "./pages/BatchDemo";
import { useNavigate } from "react-router-dom";
```

### Step 2: Update FarmerSubmit.tsx

**Option A: Keep existing file, just replace the content**

Open `src/pages/FarmerSubmit.tsx` and replace EVERYTHING with:

```tsx
import { useNavigate } from 'react-router-dom';
import BatchForm from '@/components/BatchForm';

export default function FarmerSubmit() {
  const navigate = useNavigate();

  const handleBatchSubmitted = (batchId: number) => {
    // Navigate to batch details or dashboard
    navigate(`/farmer/batch/${batchId}`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit New Harvest</h1>
        <p className="text-muted-foreground mt-1">
          Capture and submit your herb harvest data for verification.
        </p>
      </div>

      <BatchForm onSuccess={handleBatchSubmitted} />
    </div>
  );
}
```

**Option B: Use the example file**

Just copy `src/examples/FarmerSubmitExample.tsx` to `src/pages/FarmerSubmit.tsx` (overwrite).

### Step 3: Create Batch Details Page

Create a new file: `src/pages/BatchDetails.tsx`

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BatchResult from '@/components/BatchResult';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <div>Batch ID not found</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up p-6">
      <Button
        variant="outline"
        onClick={() => navigate('/farmer/batches')}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Batches
      </Button>

      <BatchResult batchId={Number(id)} />
    </div>
  );
}
```

### Step 4: Update App.tsx Routes

In `src/App.tsx`, find the farmer routes section and update it:

```tsx
// Add this import at the top
import BatchDetails from "./pages/BatchDetails";

// Then update the farmer routes:
<Route path="/farmer" element={
  <ProtectedRoute allowedRoles={['farmer']}>
    <DashboardLayout />
  </ProtectedRoute>
}>
  <Route index element={<FarmerDashboard />} />
  <Route path="submit" element={<FarmerSubmit />} />  {/* Now uses real API */}
  <Route path="batches" element={<FarmerBatches />} />
  <Route path="batch/:id" element={<BatchDetails />} />  {/* NEW */}
</Route>
```

---

## Complete App.tsx Example

Here's what your App.tsx should look like after changes:

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerSubmit from "./pages/FarmerSubmit";  // Updated with real API
import FarmerBatches from "./pages/FarmerBatches";
import BatchDetails from "./pages/BatchDetails";  // NEW
import BatchDemo from "./pages/BatchDemo";  // NEW (optional)
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import ManufacturerIncoming from "./pages/ManufacturerIncoming";
import ManufacturerReports from "./pages/ManufacturerReports";
import AuditorDashboard from "./pages/AuditorDashboard";
import AuditorHistory from "./pages/AuditorHistory";
import AuditorComplianceMap from "./pages/AuditorComplianceMap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* NEW: Demo route (no auth required) */}
            <Route path="/demo" element={<BatchDemo />} />

            {/* Farmer Routes */}
            <Route path="/farmer" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<FarmerDashboard />} />
              <Route path="submit" element={<FarmerSubmit />} />
              <Route path="batches" element={<FarmerBatches />} />
              <Route path="batch/:id" element={<BatchDetails />} />  {/* NEW */}
            </Route>

            {/* Manufacturer Routes */}
            <Route path="/manufacturer" element={
              <ProtectedRoute allowedRoles={['manufacturer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ManufacturerDashboard />} />
              <Route path="incoming" element={<ManufacturerIncoming />} />
              <Route path="reports" element={<ManufacturerReports />} />
            </Route>

            {/* Auditor Routes */}
            <Route path="/auditor" element={
              <ProtectedRoute allowedRoles={['auditor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AuditorDashboard />} />
              <Route path="history" element={<AuditorHistory />} />
              <Route path="compliance" element={<AuditorComplianceMap />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
```

---

## Testing After Integration

### Test 1: Demo Page
1. Navigate to: `http://localhost:5173/demo`
2. Submit a batch without logging in
3. See results immediately

### Test 2: Farmer Submit
1. Login as farmer at: `http://localhost:5173/auth`
2. Go to "Submit" page
3. Fill form and submit
4. Should redirect to batch details page

### Test 3: Batch Details
1. After submitting, you should see the batch details
2. URL should be: `/farmer/batch/1` (or whatever ID)
3. Click "Back to Batches" to return

---

## Common Issues

### Issue: "Cannot find module BatchDetails"
**Fix:** Create the file `src/pages/BatchDetails.tsx` (see Step 3 above)

### Issue: "Property 'children' is missing"
**Fix:** Make sure ProtectedRoute wraps `<DashboardLayout />`:
```tsx
<ProtectedRoute allowedRoles={['farmer']}>
  <DashboardLayout />
</ProtectedRoute>
```

### Issue: TypeScript errors in FarmerSubmit
**Fix:** Make sure you've imported `useNavigate` and `BatchForm`:
```tsx
import { useNavigate } from 'react-router-dom';
import BatchForm from '@/components/BatchForm';
```

---

## Minimal Quick Test

If you just want to test the integration quickly without modifying existing files:

1. Add one line to `App.tsx` imports:
```tsx
import BatchDemo from "./pages/BatchDemo";
```

2. Add one route inside `<Routes>`:
```tsx
<Route path="/demo" element={<BatchDemo />} />
```

3. Navigate to `http://localhost:5173/demo`

That's it! You can test the full batch submission workflow without touching any other files.

---

## Next Steps

1. ✅ Test `/demo` route first
2. ✅ Update FarmerSubmit.tsx
3. ✅ Create BatchDetails.tsx
4. ✅ Add route to App.tsx
5. ✅ Test full farmer workflow

---

**All files you need already exist in `src/components/` and `src/pages/`. Just integrate them into your routing!**
