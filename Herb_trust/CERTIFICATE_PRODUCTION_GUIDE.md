# Certificate Generation - Production Setup Guide

## Overview
The Certificate Generation feature is now production-ready with environment-based configuration, robust error handling, and professional PDF layout.

## Backend Configuration

### Environment Variables (backend/.env)
Required environment variables in your backend `.env` file:

```bash
# Frontend Base URL for QR code generation
FRONTEND_BASE_URL=http://localhost:5173  # Development
# FRONTEND_BASE_URL=https://yourapp.com  # Production
```

### Dependencies
All required dependencies are documented in `backend/requirements.txt`:
- Django >= 4.2.0
- djangorestframework >= 3.14.0
- reportlab >= 4.0.0
- qrcode >= 8.0.0
- Pillow >= 12.0.0
- psycopg2-binary >= 2.9.0
- python-dotenv >= 1.0.0
- django-cors-headers >= 4.3.0

Install with:
```bash
pip install -r requirements.txt
```

## Frontend Configuration

### Environment Variables (frontend/.env)
Required environment variables in your frontend `.env` file:

```bash
# Backend API Base URL
VITE_API_BASE_URL=http://127.0.0.1:8000  # Development
# VITE_API_BASE_URL=https://api.yourapp.com  # Production
```

## Certificate Endpoint

### URL
```
GET /api/batches/{id}/certificate/
```

### Authentication
- Public endpoint (AllowAny permission)
- Allows external verification via QR code scan

### Validation
- Returns HTTP 400 if batch is not approved
- Returns HTTP 404 if batch doesn't exist
- Returns HTTP 500 if PDF generation fails

### Response Headers
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="certificate_{batch_id}.pdf"
Cache-Control: no-store
```

## PDF Certificate Contents

Each certificate includes:

1. **Header**
   - Company logo (if configured)
   - "HERB TRUST CERTIFICATE OF AUTHENTICITY" title
   - Official authority line: "Verified by Herb Trust Compliance Authority"

2. **Metadata**
   - Generation timestamp (with timezone)

3. **Batch Details**
   - Batch ID
   - Crop Name
   - Harvest Date
   - Farmer Information

4. **Verification Results**
   - Authenticity Score
   - Geo Validation Status
   - Potency Score
   - Compliance Status

5. **Blockchain Verification**
   - Blockchain Hash (if available)

6. **QR Code**
   - Dynamic QR code pointing to verification page
   - URL format: `{FRONTEND_BASE_URL}/verify/{batch_id}`

7. **Signature Section**
   - Signature placeholder line
   - "Authorized Signature" label

8. **Footer**
   - Legal disclaimer text

## Production Deployment Checklist

### Backend
- [ ] Set `FRONTEND_BASE_URL` in production .env
- [ ] Install all dependencies from requirements.txt
- [ ] Configure ALLOWED_HOSTS in Django settings
- [ ] Set DEBUG=False in production
- [ ] Configure static files serving
- [ ] Set up HTTPS/SSL

### Frontend
- [ ] Set `VITE_API_BASE_URL` in production .env
- [ ] Build frontend with `npm run build`
- [ ] Deploy to hosting service (Vercel, Netlify, etc.)
- [ ] Configure custom domain
- [ ] Set up HTTPS/SSL

### Testing
- [ ] Test certificate generation for approved batches
- [ ] Verify QR code points to correct verification page
- [ ] Test certificate download in different browsers
- [ ] Verify PDF rendering quality
- [ ] Test multilingual support (if applicable)
- [ ] Test error handling for non-approved batches
- [ ] Verify mobile QR scanning works

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Troubleshooting

### QR Code Points to Wrong URL
- Check `FRONTEND_BASE_URL` in backend .env
- Verify no trailing slash in URL
- Restart backend server after changing .env

### Certificate Not Downloading
- Verify batch compliance_status is "Approved"
- Check browser console for CORS errors
- Verify VITE_API_BASE_URL is correct

### PDF Generation Errors
- Ensure reportlab and qrcode are installed
- Check batch data is complete (no null values)
- Review backend logs for detailed error messages

## Security Considerations

✅ **Implemented:**
- Cache-Control: no-store (prevents caching sensitive data)
- Public verification endpoint (allows QR scanning without auth)
- get_object_or_404 for proper error handling
- Environment-based configuration (no hardcoded URLs)

⚠️ **Recommended:**
- Implement rate limiting for certificate endpoint
- Add certificate download logging/auditing
- Consider certificate watermarking for sensitive data
- Implement certificate revocation mechanism if needed

## Support

For issues or questions:
1. Check backend logs: `python manage.py runserver` output
2. Check frontend console: Browser DevTools
3. Verify environment variables are set correctly
4. Review this documentation

---

**Last Updated:** February 17, 2026
**Feature Version:** 2.0 (Production-Ready)
