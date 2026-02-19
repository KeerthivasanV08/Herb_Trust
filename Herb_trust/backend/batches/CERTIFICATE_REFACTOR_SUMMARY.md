# Certificate PDF Generation - Refactoring Summary

## Overview
Refactored the `certificate.py` module to provide production-ready PDF certificate generation with embedded QR codes for herbal product batch verification.

## Key Improvements

### 1. **Memory-Safe QR Code Generation**
- **Helper Function**: `_generate_qr_code(data, size)`
  - Uses `BytesIO` for all image operations (no disk I/O)
  - PIL Image resizing with LANCZOS resampling for quality
  - High error correction level (ERROR_CORRECT_H)
  - Optimized PNG compression
  - Proper exception handling with custom `CertificateGenerationError`

### 2. **Proper QR Code Embedding**
- QR codes are generated in-memory and embedded directly into PDF
- Fixed position (center-aligned) at 4.5cm × 4.5cm size
- Encodes verification URL: `https://mydomain.com/verify/{batch_id}`
- Alternative: Can encode blockchain hash by setting `use_hash=True`

### 3. **A4 Layout with Professional Design**
- Changed from US Letter to A4 pagesize (international standard)
- Margins: 2.0cm on all sides
- Responsive table layouts with proper column widths
- Color-coded compliance status (green for Approved, red otherwise)
- Brand colors: #1a5339 (primary green), #2d7a4a (secondary)

### 4. **Error Handling & Logging**
- Custom exception: `CertificateGenerationError`
- Comprehensive logging at key steps
- Safe attribute access with try-except blocks
- Graceful logo loading fallback
- Detailed error messages for debugging

### 5. **Production-Ready Features**
- PDF metadata (title, author)
- KeepTogether for table elements (prevents page breaks mid-table)
- Conditional region display
- Safe farmer name retrieval with fallbacks
- Environment variable support for `FRONTEND_BASE_URL`

## Code Structure

### Helper Functions

#### `_generate_qr_code(data: str, size: int = 300) -> io.BytesIO`
```python
# Generates QR code as BytesIO PNG image
# - High error correction
# - Custom branding colors (#1a5339 green)
# - Memory-safe operations
```

#### `_get_verification_url(batch_id: int, use_hash: bool, blockchain_hash: str) -> str`
```python
# Builds verification URL or returns blockchain hash
# - Environment-aware URL construction
# - Fallback to localhost:5173 for development
```

### Main Function

#### `generate_certificate_pdf(batch) -> bytes`
Main certificate generation function that:
1. Creates in-memory PDF buffer
2. Sets up A4 document with SimpleDocTemplate
3. Defines custom paragraph styles
4. Builds content story with:
   - Optional logo
   - Title and authority information
   - Batch details table
   - Verification results table
   - Blockchain hash display
   - Embedded QR code
   - Signature section
   - Legal disclaimer footer
5. Returns PDF as bytes for HTTP response

## Usage Example

### In Django View
```python
from django.http import HttpResponse
from .certificate import generate_certificate_pdf, CertificateGenerationError

def download_certificate(request, batch_id):
    try:
        batch = Batch.objects.get(id=batch_id, compliance_status='Approved')
        pdf_bytes = generate_certificate_pdf(batch)
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate_{batch.id}.pdf"'
        return response
        
    except Batch.DoesNotExist:
        return HttpResponse("Batch not found", status=404)
    except CertificateGenerationError as e:
        logger.error(f"Certificate error: {e}")
        return HttpResponse("Certificate generation failed", status=500)
```

## Configuration

### Environment Variables
- `FRONTEND_BASE_URL`: Base URL for verification links (default: `http://localhost:5173`)
- `STATIC_ROOT`: Django static files root for logo path

### Dependencies
```
reportlab>=4.0.0
qrcode[pil]>=7.4.0
Pillow>=10.0.0
```

## QR Code Customization

### To Encode Blockchain Hash Instead of URL
```python
verification_data = _get_verification_url(
    batch_id=batch.id,
    use_hash=True,  # Change this to True
    blockchain_hash=batch.blockchain_hash
)
```

### QR Code Parameters
- **Version**: 1 (auto-adjusts)
- **Error Correction**: H (30% recovery)
- **Box Size**: 10 pixels per module
- **Border**: 4 modules (standard)
- **Colors**: Fill #1a5339, Background white
- **Size**: 300×300 pixels → 4.5×4.5 cm in PDF

## Certificate Sections

1. **Header**
   - Optional logo (herb_trust_logo.png)
   - Title: "HERB TRUST CERTIFICATE OF AUTHENTICITY"
   - Authority verification statement
   - Generation timestamp

2. **Batch Information Table**
   - Batch ID
   - Crop Name
   - Harvest Date
   - Farmer Name
   - Region (if available)

3. **Verification Results Table**
   - Authenticity Score (AI-generated)
   - Geo Validation Status
   - Potency Score
   - Compliance Status (color-coded)

4. **Blockchain Verification**
   - Transaction hash (monospace font)
   - Pending message if hash unavailable

5. **QR Code Section**
   - Centered 4.5cm QR code
   - URL/hash display below QR

6. **Footer**
   - Signature line
   - Legal disclaimer

## Error Handling

### Custom Exception
```python
class CertificateGenerationError(Exception):
    """Raised when certificate PDF generation fails."""
```

### Caught Scenarios
- QR code generation failure
- PIL image operations failure
- Logo loading errors (graceful fallback)
- Missing batch attributes
- PDF build errors

## Logging
All operations logged to Django logger:
- Info: Successful QR generation, PDF build completion
- Warning: Logo loading failures, missing farmer data
- Error: QR failures, unexpected exceptions with full stack traces

## Testing Checklist

- [ ] Certificate generates for approved batches
- [ ] QR code scans correctly with mobile devices
- [ ] All batch data displays properly
- [ ] Logo loads when available
- [ ] Fallback works when logo missing
- [ ] Environment URL configuration works
- [ ] Error handling triggers on invalid data
- [ ] PDF downloads with correct filename
- [ ] A4 pagesize renders correctly
- [ ] Tables don't break across pages

## Future Enhancements

1. **Digital Signatures**: Integrate cryptographic signing
2. **Watermarks**: Add "COPY" watermark for non-originals
3. **Multi-language**: i18n support for certificate text
4. **Custom Branding**: Allow farmer-specific logos
5. **Batch QR Codes**: Support multiple QR codes per certificate
6. **PDF/A Compliance**: Archive-grade PDF generation

---

**Last Updated**: December 2024  
**Module**: `backend/batches/certificate.py`  
**Dependencies**: reportlab, qrcode, Pillow, Django 4.2+
