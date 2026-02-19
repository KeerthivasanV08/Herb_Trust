"""
Example usage of the refactored certificate generation in Django views.

This file demonstrates how to integrate the new certificate.py module
into your batch management views.
"""

from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Batch
from .certificate import generate_certificate_pdf, CertificateGenerationError
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def download_certificate(request, batch_id):
    """
    Download PDF certificate for an approved batch.
    
    GET /api/batches/{batch_id}/certificate/
    
    Returns:
        - 200: PDF file download
        - 404: Batch not found
        - 400: Batch not approved
        - 500: Certificate generation error
    """
    try:
        # Fetch batch
        batch = Batch.objects.get(id=batch_id)
        
        # Check if batch is approved
        if batch.compliance_status != 'Approved':
            return JsonResponse({
                'error': 'Certificate only available for approved batches',
                'status': batch.compliance_status
            }, status=400)
        
        # Generate PDF certificate
        pdf_bytes = generate_certificate_pdf(batch)
        
        # Create HTTP response with PDF
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="herb_trust_certificate_{batch.id}.pdf"'
        response['Content-Length'] = len(pdf_bytes)
        
        logger.info(f"Certificate downloaded for batch {batch_id}")
        return response
        
    except Batch.DoesNotExist:
        return JsonResponse({'error': 'Batch not found'}, status=404)
        
    except CertificateGenerationError as e:
        logger.error(f"Certificate generation error for batch {batch_id}: {str(e)}")
        return JsonResponse({
            'error': 'Failed to generate certificate',
            'details': str(e)
        }, status=500)
        
    except Exception as e:
        logger.error(f"Unexpected error downloading certificate: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'Internal server error'}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def preview_certificate(request, batch_id):
    """
    Preview certificate in browser (inline, not download).
    
    GET /api/batches/{batch_id}/certificate/preview/
    """
    try:
        batch = Batch.objects.get(id=batch_id)
        
        if batch.compliance_status != 'Approved':
            return JsonResponse({
                'error': 'Certificate only available for approved batches'
            }, status=400)
        
        pdf_bytes = generate_certificate_pdf(batch)
        
        # Inline display instead of download
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="certificate_{batch.id}.pdf"'
        return response
        
    except Batch.DoesNotExist:
        return JsonResponse({'error': 'Batch not found'}, status=404)
        
    except CertificateGenerationError as e:
        logger.error(f"Certificate preview error: {str(e)}")
        return JsonResponse({'error': 'Certificate generation failed'}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def regenerate_certificate(request, batch_id):
    """
    Force regenerate certificate for a batch (useful if data updated).
    
    POST /api/batches/{batch_id}/certificate/regenerate/
    """
    try:
        batch = Batch.objects.get(id=batch_id)
        
        # Generate fresh certificate
        pdf_bytes = generate_certificate_pdf(batch)
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate_{batch.id}_regenerated.pdf"'
        
        logger.info(f"Certificate regenerated for batch {batch_id}")
        return response
        
    except Batch.DoesNotExist:
        return JsonResponse({'error': 'Batch not found'}, status=404)
        
    except CertificateGenerationError as e:
        logger.error(f"Certificate regeneration error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


# Add these routes to urls.py:
"""
from django.urls import path
from .views import download_certificate, preview_certificate, regenerate_certificate

urlpatterns = [
    # ... existing routes ...
    path('batches/<int:batch_id>/certificate/', download_certificate, name='batch-certificate'),
    path('batches/<int:batch_id>/certificate/preview/', preview_certificate, name='batch-certificate-preview'),
    path('batches/<int:batch_id>/certificate/regenerate/', regenerate_certificate, name='batch-certificate-regenerate'),
]
"""
