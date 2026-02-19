# Certificate PDF Testing Guide

## Quick Testing Checklist

### Prerequisites
```bash
# Ensure dependencies are installed
pip install reportlab qrcode[pil] Pillow

# Check backend is running
python manage.py runserver
```

### 1. Basic Certificate Generation Test

#### Django Shell Test
```python
python manage.py shell

# In shell:
from batches.models import Batch
from batches.certificate import generate_certificate_pdf, CertificateGenerationError

# Get an approved batch
batch = Batch.objects.filter(compliance_status='Approved').first()

# Generate certificate
try:
    pdf_bytes = generate_certificate_pdf(batch)
    print(f"✓ Success! Generated {len(pdf_bytes)} bytes")
    
    # Save to file for testing
    with open('test_certificate.pdf', 'wb') as f:
        f.write(pdf_bytes)
    print("✓ Saved to test_certificate.pdf")
    
except CertificateGenerationError as e:
    print(f"✗ Error: {e}")
```

### 2. QR Code Verification Test

#### Test QR Code Generation
```python
from batches.certificate import _generate_qr_code

# Test QR code creation
qr_buffer = _generate_qr_code("https://example.com/verify/123", size=300)
print(f"✓ QR code size: {len(qr_buffer.getvalue())} bytes")

# Save QR for visual inspection
with open('test_qr.png', 'wb') as f:
    f.write(qr_buffer.getvalue())
print("✓ Saved to test_qr.png")
```

#### Scan QR Code
1. Open `test_certificate.pdf`
2. Scan QR code with phone camera
3. Verify URL redirects to: `http://localhost:5173/verify/{batch_id}`

### 3. API Endpoint Testing

#### Using curl
```bash
# Download certificate
curl -X GET http://localhost:8000/api/batches/1/certificate/ -o certificate.pdf

# Preview certificate (browser)
curl -X GET http://localhost:8000/api/batches/1/certificate/preview/ -o preview.pdf

# Check response
ls -lh certificate.pdf
```

#### Using Postman/Insomnia
```
GET http://localhost:8000/api/batches/{batch_id}/certificate/
Headers:
  Accept: application/pdf
```

Expected Response:
- Status: 200 OK
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="herb_trust_certificate_{batch_id}.pdf"

### 4. Error Handling Tests

#### Test Missing Batch
```bash
curl http://localhost:8000/api/batches/99999/certificate/
# Expected: {"error": "Batch not found"} 404
```

#### Test Non-Approved Batch
```python
# Django shell
from batches.models import Batch

batch = Batch.objects.filter(compliance_status='Pending').first()
if batch:
    from batches.certificate import generate_certificate_pdf
    pdf = generate_certificate_pdf(batch)
    # Should still work but show "Pending" status
```

#### Test Invalid QR Data
```python
from batches.certificate import _generate_qr_code

# Test with empty string (should handle gracefully)
try:
    qr = _generate_qr_code("")
    print("✗ Should have raised error for empty data")
except Exception as e:
    print(f"✓ Correctly handled error: {e}")
```

### 5. Visual Quality Tests

#### Open PDF and Check:
- [ ] A4 page size (not US Letter)
- [ ] Logo displays correctly (if available)
- [ ] All text is readable and aligned
- [ ] Tables have proper borders and colors
- [ ] QR code is 4.5cm × 4.5cm
- [ ] QR code is centered
- [ ] Green colors match brand (#1a5339)
- [ ] Approved status shows in green
- [ ] All batch data populated correctly
- [ ] Timestamp shows current time
- [ ] Blockchain hash displays (or "Pending" message)
- [ ] Footer disclaimer is visible
- [ ] Signature line is present

### 6. QR Code Functionality Tests

#### Mobile Scan Test
1. Print or display PDF on screen
2. Open camera app on phone
3. Scan QR code
4. Verify it opens browser
5. Verify URL is correct format
6. Check if verification page loads

#### QR Code Reader Apps
- QR Code Reader (iOS/Android)
- Google Lens
- Built-in camera app

Expected result:
```
URL: http://localhost:5173/verify/1
(or your FRONTEND_BASE_URL from environment)
```

### 7. Performance Tests

#### Test Generation Speed
```python
import time
from batches.models import Batch
from batches.certificate import generate_certificate_pdf

batch = Batch.objects.first()

start = time.time()
pdf = generate_certificate_pdf(batch)
elapsed = time.time() - start

print(f"Generation time: {elapsed:.2f}s")
print(f"PDF size: {len(pdf) / 1024:.1f} KB")

# Benchmark: Should be < 2 seconds
assert elapsed < 2.0, "Certificate generation too slow!"
```

#### Bulk Generation Test
```python
from batches.models import Batch
from batches.certificate import generate_certificate_pdf
import time

batches = Batch.objects.all()[:10]
start = time.time()

for batch in batches:
    pdf = generate_certificate_pdf(batch)
    
elapsed = time.time() - start
avg = elapsed / len(batches)
print(f"Average time per certificate: {avg:.2f}s")
```

### 8. Environment Configuration Tests

#### Test FRONTEND_BASE_URL
```bash
# Terminal 1: Set production URL
export FRONTEND_BASE_URL=https://herbtrust.com
python manage.py runserver

# Terminal 2: Generate certificate
curl http://localhost:8000/api/batches/1/certificate/ -o test.pdf

# Verify QR code encodes: https://herbtrust.com/verify/1
```

#### Test Logo Path
```python
from django.conf import settings
from pathlib import Path

# Check STATIC_ROOT configuration
print(f"STATIC_ROOT: {settings.STATIC_ROOT}")

# Check if logo exists
logo_path = Path(settings.STATIC_ROOT) / 'herb_trust_logo.png'
print(f"Logo exists: {logo_path.exists()}")
```

### 9. Data Edge Cases

#### Test with Minimal Data
```python
from batches.models import Batch
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Create batch with minimal data
batch = Batch.objects.create(
    farmer=user,
    herb_type="Test Herb",
    harvest_date="2024-01-01",
    compliance_status="Approved"
)

pdf = generate_certificate_pdf(batch)
# Should handle missing fields gracefully
```

#### Test with Long Strings
```python
batch.herb_type = "A" * 200  # Very long name
batch.blockchain_hash = "0x" + "a" * 128  # Long hash
pdf = generate_certificate_pdf(batch)
# Should not break layout
```

#### Test with Special Characters
```python
batch.herb_type = "Herb™ with €uro & <special> chars"
pdf = generate_certificate_pdf(batch)
# Should escape properly
```

### 10. Integration Tests

#### Full Workflow Test
```python
from batches.models import Batch
from batches.certificate import generate_certificate_pdf
from django.http import HttpResponse

# 1. Create batch
batch = Batch.objects.create(...)

# 2. Verify with AI
from ai_engine.services import verify_herb
batch.authenticity_score = verify_herb(image_path)

# 3. Run compliance
from compliance.services import compliance_decision
batch.compliance_status = compliance_decision(...)
batch.save()

# 4. Generate certificate
if batch.compliance_status == 'Approved':
    pdf = generate_certificate_pdf(batch)
    
    # 5. Serve to user
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="cert_{batch.id}.pdf"'
```

### 11. Logging Tests

#### Check Log Output
```python
import logging
logging.basicConfig(level=logging.INFO)

from batches.certificate import generate_certificate_pdf, _generate_qr_code
from batches.models import Batch

batch = Batch.objects.first()
pdf = generate_certificate_pdf(batch)

# Expected logs:
# INFO: QR code generated successfully for data: http://...
# INFO: Building PDF certificate for batch 1
# INFO: Successfully generated XXXXX byte certificate PDF for batch 1
```

### 12. Frontend Integration Test

#### Add Download Button
```typescript
// In BatchResult.tsx or similar
const downloadCertificate = async (batchId: number) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/batches/${batchId}/certificate/`,
      { method: 'GET' }
    );
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${batchId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('✓ Certificate downloaded');
  } catch (error) {
    console.error('✗ Download error:', error);
  }
};
```

## Common Issues & Solutions

### Issue: "No module named 'PIL'"
```bash
pip install Pillow
```

### Issue: "QR code generation failed"
```bash
pip install qrcode[pil]
```

### Issue: "Cannot import canvas"
```bash
pip install reportlab
```

### Issue: Logo not showing
```python
# Check STATIC_ROOT in settings.py
STATIC_ROOT = BASE_DIR / 'static'

# Place logo at: backend/static/herb_trust_logo.png
```

### Issue: QR code not scannable
- Increase size parameter in _generate_qr_code()
- Check error correction level (currently HIGH)
- Ensure sufficient contrast (dark on light background)

### Issue: PDF layout broken
- Verify A4 pagesize (not letter)
- Check table column widths (should fit within margins)
- Use KeepTogether for elements that shouldn't split

## Success Criteria

✅ **Certificate generates without errors**  
✅ **QR code scans successfully**  
✅ **All batch data displays correctly**  
✅ **A4 layout looks professional**  
✅ **Generation time < 2 seconds**  
✅ **PDF size < 500 KB**  
✅ **Mobile-friendly QR codes**  
✅ **Proper error handling**  
✅ **Logging works correctly**  
✅ **Frontend integration successful**

## Next Steps After Testing

1. Deploy to staging environment
2. Test with production FRONTEND_BASE_URL
3. Verify blockchain hash integration
4. Test with real herbal batch data
5. User acceptance testing
6. Performance testing under load
7. Security audit of certificate generation
8. Monitor log files for issues

---

**Testing Completed**: ___________  
**Tested By**: ___________  
**Notes**: ___________
