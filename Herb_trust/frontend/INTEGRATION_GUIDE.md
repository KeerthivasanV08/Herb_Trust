# Frontend-Backend Integration Guide

## ✅ Setup Complete

Your frontend is now connected to the Django backend API with:
- ✅ Axios API client configured
- ✅ TypeScript types defined
- ✅ Environment variables setup
- ✅ BatchForm component (batch submission)
- ✅ BatchResult component (real-time verification results)
- ✅ Error handling and loading states

---

## 📁 New File Structure

```
frontend/src/
├── services/
│   └── api.ts                 # API client with all backend calls
├── types/
│   └── batch.ts               # TypeScript interfaces
├── components/
│   ├── BatchForm.tsx          # Submit batch form
│   └── BatchResult.tsx        # Display verification results
├── pages/
│   └── BatchDemo.tsx          # Demo page (both components)
├── vite-env.d.ts              # Environment variable types
├── .env                       # Environment configuration
└── .env.example               # Template for .env
```

---

## 🔧 Configuration

### Environment Variables

File: `.env`
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**Important:** Restart Vite dev server after changing `.env` files!

---

## 🚀 Quick Start

### 1. Start Backend (Django)
```bash
cd backend
.\venv\Scripts\python.exe manage.py runserver
```
Backend runs at: **http://127.0.0.1:8000**

### 2. Start Frontend (Vite)
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

### 3. Test the Demo Page
Navigate to the `BatchDemo` component or integrate into your app.

---

## 🎯 Using the Components

### Option 1: Demo Page (Standalone)

Import in your router:
```tsx
import BatchDemo from '@/pages/BatchDemo';

// In your routes
{
  path: '/batch-demo',
  element: <BatchDemo />
}
```

### Option 2: Integrate into Existing Pages

**Replace FarmerSubmit.tsx mock logic:**
```tsx
import BatchForm from '@/components/BatchForm';

export default function FarmerSubmit() {
  const navigate = useNavigate();

  return (
    <BatchForm 
      onSuccess={(batchId) => {
        navigate(`/batch/${batchId}`);
      }} 
    />
  );
}
```

**Display results in FarmerDashboard or separate page:**
```tsx
import { useParams } from 'react-router-dom';
import BatchResult from '@/components/BatchResult';

export default function BatchDetails() {
  const { id } = useParams();
  
  return <BatchResult batchId={Number(id)} />;
}
```

---

## 📡 API Functions Reference

### Import
```tsx
import { createBatch, getBatchById, getAllBatches } from '@/services/api';
```

### 1. Submit Batch
```tsx
const handleSubmit = async () => {
  const result = await createBatch({
    herb_type: 'Ashwagandha',
    harvest_date: '2026-02-15',
    latitude: 23.2599,
    longitude: 77.4126,
    image: imageFile, // File object
  });
  
  console.log('Batch ID:', result.id);
};
```

### 2. Get Batch by ID
```tsx
const batch = await getBatchById(123);
console.log('Authenticity:', batch.authenticity_score);
console.log('Hash:', batch.blockchain_hash);
```

### 3. Get All Batches
```tsx
const batches = await getAllBatches();
console.log('Total batches:', batches.length);
```

---

## 🔄 Data Flow

```
User fills form → BatchForm component
                      ↓
                 createBatch() API call
                      ↓
                Django Backend
                      ↓
           [AI Verification Pipeline]
           • verify_herb() → authenticity_score
           • validate_location() → geo_valid
           • predict_potency() → potency_score
           • compliance_decision() → compliance_status
           • generate_hash() → blockchain_hash
                      ↓
                Response with all fields
                      ↓
                 BatchResult component
                      ↓
                Display to user
```

---

## 🎨 Component Features

### BatchForm
- ✅ Live form validation
- ✅ Image preview
- ✅ Geolocation API integration
- ✅ Real-time error messages
- ✅ Loading states during submission
- ✅ Success callback with batch ID

### BatchResult
- ✅ Fetches real-time data from backend
- ✅ Loading spinner during fetch
- ✅ Error handling UI
- ✅ Progress bars for scores
- ✅ Color-coded compliance status
- ✅ Blockchain hash display
- ✅ Responsive Tailwind design

---

## ⚠️ Django Backend Requirements

### CORS Configuration

Verify in `backend/config/settings.py`:
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # For development
```

### Session Authentication

The API uses Django's SessionAuthentication but is configured to allow public access for demo purposes.

### Media Files

Ensure these are in `settings.py`:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

And in `config/urls.py`:
```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 🧪 Testing the Integration

### 1. Test Backend Directly
```bash
curl -X GET http://127.0.0.1:8000/api/batches/
```

### 2. Test Form Submission
1. Open frontend
2. Fill out BatchForm
3. Upload an image
4. Submit
5. Check Network tab in DevTools
6. Verify POST to `/api/batches/`

### 3. Test Result Display
1. After submission, note the batch ID
2. Component should auto-fetch results
3. Watch scores populate in real-time

---

## 📊 TypeScript Types

```typescript
interface Batch {
  id: number;
  herb_type: string;
  harvest_date: string;
  latitude: number;
  longitude: number;
  image: string;
  authenticity_score: number | null;
  geo_valid: boolean | null;
  potency_score: number | null;
  compliance_status: string | null;
  blockchain_hash: string | null;
  created_at: string;
}
```

---

## 🐛 Troubleshooting

### CORS Errors
- Install: `pip install django-cors-headers`
- Add to `INSTALLED_APPS` and `MIDDLEWARE`
- Set `CORS_ALLOW_ALL_ORIGINS = True`

### API URL Not Found
- Check `.env` has `VITE_API_BASE_URL=http://127.0.0.1:8000`
- Restart Vite dev server (`npm run dev`)

### Image Not Loading
- Use full URL: `http://127.0.0.1:8000${batch.image}`
- Check Django serves media files in development

### Types Not Recognized
- Ensure `vite-env.d.ts` is updated
- Restart TypeScript server in VS Code

---

## 🚢 Production Checklist

- [ ] Update `VITE_API_BASE_URL` to production API
- [ ] Change `CORS_ALLOW_ALL_ORIGINS` to specific origins
- [ ] Enable HTTPS
- [ ] Add authentication (JWT tokens)
- [ ] Add rate limiting
- [ ] Configure proper file upload limits
- [ ] Add image compression
- [ ] Add retry logic for API calls

---

## 📝 Notes

- **No mock data used** - Everything fetches from Django
- **Real-time verification** - Results update as backend processes
- **Error boundaries** - Graceful handling of API failures
- **Type-safe** - Full TypeScript coverage
- **Responsive** - Works on mobile and desktop

---

**Integration Status:** ✅ **COMPLETE AND READY FOR DEMO**
