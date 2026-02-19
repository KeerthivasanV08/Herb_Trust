# 🧪 Testing Checklist - Frontend-Backend Integration

## Pre-Flight Check

### Backend Setup ✓
- [ ] Virtual environment activated
- [ ] All dependencies installed (check: `pip list` shows transformers, django, etc.)
- [ ] Database migrations applied (`python manage.py migrate`)
- [ ] `.env` file configured with Supabase credentials
- [ ] CORS enabled in `settings.py`
- [ ] Media files configured

**Start Backend:**
```bash
cd backend
.\venv\Scripts\python.exe manage.py runserver
```

**Expected:** Server running at `http://127.0.0.1:8000`

---

### Frontend Setup ✓
- [ ] Axios installed (`npm list axios`)
- [ ] `.env` file exists with `VITE_API_BASE_URL=http://127.0.0.1:8000`
- [ ] All new files created:
  - [ ] `src/services/api.ts`
  - [ ] `src/types/batch.ts`
  - [ ] `src/components/BatchForm.tsx`
  - [ ] `src/components/BatchResult.tsx`
  - [ ] `src/pages/BatchDemo.tsx`

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Expected:** Server running at `http://localhost:5173`

---

## Test 1: API Connection ✓

### Check backend is accessible
Open browser console and run:
```javascript
fetch('http://127.0.0.1:8000/api/batches/')
  .then(r => r.json())
  .then(console.log)
```

**Expected:** JSON array (empty or with batches)
**If CORS error:** Check Django CORS settings

---

## Test 2: Component Rendering ✓

### Import and use BatchDemo
In your `App.tsx` or router, temporarily add:
```tsx
import BatchDemo from '@/pages/BatchDemo';

// Then render it
<BatchDemo />
```

**Expected:**
- [ ] Page loads without TypeScript errors
- [ ] Form displays with all fields
- [ ] No console errors

---

## Test 3: Form Submission ✓

### Fill out the form:
1. **Herb Type:** Select "Ashwagandha" or "Tulsi"
2. **Harvest Date:** Pick today's date
3. **Location:** 
   - Click "Get Current Location" (allow browser permission)
   - OR manually enter: `23.2599` and `77.4126`
4. **Image:** Upload any image file (JPG, PNG)
5. **Click:** "Submit Batch"

**Expected:**
- [ ] Loading spinner appears
- [ ] Network tab shows POST to `/api/batches/`
- [ ] Request includes FormData with all fields
- [ ] Success message appears after ~2-5 seconds
- [ ] Form resets automatically

**Check the request payload in Network tab:**
```
herb_type: Ashwagandha
harvest_date: 2026-02-17
latitude: 23.2599
longitude: 77.4126
image: (binary)
```

---

## Test 4: Verification Pipeline ✓

### After successful submission:
**Expected immediate response:**
```json
{
  "id": 1,
  "herb_type": "Ashwagandha",
  "harvest_date": "2026-02-17",
  "latitude": 23.2599,
  "longitude": 77.4126,
  "image": "/media/batches/filename.jpg",
  "authenticity_score": 87.45,       // ← Auto-generated
  "geo_valid": true,                 // ← Auto-generated
  "potency_score": 92.30,            // ← Auto-generated
  "compliance_status": "Approved",   // ← Auto-generated
  "blockchain_hash": "3f8a9b...",    // ← Auto-generated (SHA256)
  "created_at": "2026-02-17T10:30:00Z"
}
```

**Verify auto-generated fields:**
- [ ] `authenticity_score` is a number (0-100)
- [ ] `geo_valid` is true/false
- [ ] `potency_score` is a number (0-100)
- [ ] `compliance_status` is "Approved", "Rejected", or "Fraud Suspected"
- [ ] `blockchain_hash` is 64-character hex string
- [ ] All fields are NOT null

---

## Test 5: Results Display ✓

### BatchResult component should automatically show:

**Header:**
- [ ] Batch ID displayed (e.g., "Batch #1")
- [ ] Compliance status badge (color-coded)

**Verification Results Card:**
- [ ] Authenticity Score with percentage
- [ ] Progress bar (green if ≥75%, red if <75%)
- [ ] Geo Validation (checkmark or X icon)
- [ ] Potency Score with percentage
- [ ] Progress bar (green if ≥60%, yellow if <60%)

**Compliance Decision Card:**
- [ ] Large status display with icon
- [ ] Descriptive text explaining status

**Blockchain Hash Card:**
- [ ] 64-character hash displayed in monospace font
- [ ] Hash icon shown

**Batch Details Card:**
- [ ] Herb type, harvest date, location, submission time

**Image Card:**
- [ ] Uploaded image displays from backend
- [ ] Image URL: `http://127.0.0.1:8000/media/batches/...`

---

## Test 6: Error Handling ✓

### Test validation errors:
1. Try submitting form without selecting herb type
   - [ ] Error message: "Please select an herb type"

2. Try submitting without image
   - [ ] Error message: "Please upload an image"

3. Try submitting without location
   - [ ] Error message: "Please provide location coordinates"

### Test network errors:
1. Stop Django backend server
2. Try submitting form
   - [ ] Error alert appears
   - [ ] User-friendly message displayed
   - [ ] No app crash

---

## Test 7: Multiple Batches ✓

### Submit 3 different batches:

**Batch 1:** Ashwagandha, recent harvest date, valid location
- [ ] Should get "Approved" status

**Batch 2:** Tulsi, recent harvest date, valid location  
- [ ] Should get "Approved" status

**Batch 3:** (Optional) Try invalid coordinates outside valid range
- [ ] Should get different geo_valid status

**Then verify:**
- [ ] Each batch has unique ID
- [ ] Each has different blockchain hash
- [ ] All batches visible in backend: `http://127.0.0.1:8000/api/batches/`

---

## Test 8: Component Integration ✓

### Option A: Use BatchList component
```tsx
import BatchList from '@/components/BatchList';
<BatchList />
```
- [ ] Shows grid of all batches
- [ ] Each card displays key metrics
- [ ] Cards are clickable

### Option B: Use in existing pages
Replace mock logic in:
- [ ] `FarmerSubmit.tsx` with `<BatchForm />`
- [ ] Create batch details page with `<BatchResult />`
- [ ] Update dashboard to fetch real batches

---

## Test 9: Browser DevTools Check ✓

### Console Tab:
- [ ] No TypeScript errors
- [ ] No React warnings
- [ ] No CORS errors

### Network Tab:
**During form submission:**
- [ ] Request URL: `http://127.0.0.1:8000/api/batches/`
- [ ] Request Method: POST
- [ ] Content-Type: multipart/form-data
- [ ] Status: 201 Created

**During results fetch:**
- [ ] Request URL: `http://127.0.0.1:8000/api/batches/1/`
- [ ] Request Method: GET
- [ ] Status: 200 OK

### Application Tab:
- [ ] Check localStorage (auth data if applicable)
- [ ] Check cookies (session ID if using session auth)

---

## Test 10: Backend Verification ✓

### Check Django Admin (optional):
1. Create superuser: `python manage.py createsuperuser`
2. Login at: `http://127.0.0.1:8000/admin`
3. Navigate to Batches
4. Verify:
   - [ ] All submitted batches appear
   - [ ] Auto-generated fields are populated
   - [ ] Images are uploaded to `media/batches/`

### Check Database Directly:
```bash
.\venv\Scripts\python.exe manage.py shell
```
```python
from batches.models import Batch
batches = Batch.objects.all()
for b in batches:
    print(f"Batch {b.id}: {b.compliance_status}, Hash: {b.blockchain_hash}")
```

---

## 🎯 Success Criteria

All tests passed = ✅ **Production Ready**

### Must Have:
- ✅ Form submits successfully
- ✅ All auto-generated fields populate
- ✅ Blockchain hash is 64-char SHA256
- ✅ Results display correctly
- ✅ Error handling works
- ✅ No console errors
- ✅ CORS working
- ✅ Images upload and display

### Nice to Have:
- ✅ Loading states smooth
- ✅ UI responsive on mobile
- ✅ Form validation comprehensive
- ✅ Success animations pleasant

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error
**Fix:**
```bash
cd backend
pip install django-cors-headers
```
Add to `settings.py`:
```python
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...] 
CORS_ALLOW_ALL_ORIGINS = True
```

### Issue: Module not found 'axios'
**Fix:**
```bash
cd frontend
npm install axios
```

### Issue: Environment variable not loading
**Fix:**
- Ensure `.env` exists in frontend root
- Restart Vite dev server (`Ctrl+C`, then `npm run dev`)
- Check variable name starts with `VITE_`

### Issue: Image not displaying
**Fix:**
- Check backend serving media: `MEDIA_URL = '/media/'`
- Add to `urls.py`:
```python
from django.conf.urls.static import static
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### Issue: Authenticity score is 0 or low
**Explanation:** 
- ViT model returns confidence for image classification
- Not specifically trained on herbs
- For demo purposes, any uploaded image will work
- Score reflects model's confidence in classification

---

## 📊 Expected Data Flow

```
Frontend Form
    ↓ FormData
Django BatchViewSet.perform_create()
    ↓ batch.save() (initial)
    ↓ verify_herb(image) → authenticity_score
    ↓ validate_location() → geo_valid  
    ↓ predict_potency() → potency_score
    ↓ compliance_decision() → compliance_status
    ↓ generate_hash() → blockchain_hash
    ↓ batch.save() (with all fields)
    ↓ JSON Response
Frontend BatchResult
    ↓ Display
User sees results
```

---

**Integration Status:** ✅ **READY FOR DEMONSTRATION**

---

## Need Help?

Check these files:
- `INTEGRATION_GUIDE.md` - Full documentation
- `SETUP_SUMMARY.md` - Quick overview
- `src/examples/` - Code examples

Or review the backend:
- `backend/batches/views.py` - API endpoint logic
- `backend/batches/serializers.py` - Data structure
- `backend/ai_engine/services.py` - AI verification
- `backend/compliance/services.py` - Compliance logic
