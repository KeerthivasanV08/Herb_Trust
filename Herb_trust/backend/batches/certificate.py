"""
Certificate PDF generation using reportlab with QR code embedding.

This module generates professional A4 certificates for verified herbal batches.
QR codes encode verification URLs and are embedded directly into the PDF.
All file operations use in-memory BytesIO for production safety.
"""
import io
import os
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

import qrcode
from PIL import Image as PILImage
from django.utils import timezone
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, 
    Paragraph, 
    Spacer, 
    Image, 
    Table, 
    TableStyle,
    KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)


class CertificateGenerationError(Exception):
    """Raised when certificate PDF generation fails."""
    pass


def _generate_qr_code(data: str, size: int = 300) -> io.BytesIO:
    """
    Generate QR code image as BytesIO object.
    
    Args:
        data: String to encode (URL or hash)
        size: Pixel size of QR code (default 300x300)
        
    Returns:
        BytesIO object containing PNG image
        
    Raises:
        CertificateGenerationError: If QR generation fails
    """
    try:
        qr = qrcode.QRCode(
            version=1,  # Auto-adjust size
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        # Generate PIL Image
        qr_img = qr.make_image(fill_color='#1a5339', back_color='white')
        
        # Resize to exact dimensions
        qr_img = qr_img.resize((size, size), PILImage.Resampling.LANCZOS)
        
        # Save to BytesIO
        img_buffer = io.BytesIO()
        qr_img.save(img_buffer, format='PNG', optimize=True)
        img_buffer.seek(0)
        
        logger.info(f"QR code generated successfully for data: {data[:50]}...")
        return img_buffer
        
    except Exception as e:
        logger.error(f"QR code generation failed: {str(e)}")
        raise CertificateGenerationError(f"Failed to generate QR code: {str(e)}")


def _get_verification_url(batch_id: int, use_hash: bool = False, blockchain_hash: Optional[str] = None) -> str:
    """
    Build verification URL or return blockchain hash.
    
    Args:
        batch_id: Batch ID number
        use_hash: If True, return blockchain hash instead of URL
        blockchain_hash: Optional blockchain hash string
        
    Returns:
        Verification URL or blockchain hash
    """
    if use_hash and blockchain_hash:
        return blockchain_hash
    
    frontend_base_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:5173')
    return f'{frontend_base_url}/verify/{batch_id}'


def generate_certificate_pdf(batch):
    """
    Generate a professional A4 PDF certificate with embedded QR code.
    
    This function creates a verification certificate for herbal product batches,
    including authenticity scores, compliance status, and a QR code for digital
    verification. All operations are performed in-memory using BytesIO.
    
    Args:
        batch: Batch model instance with attributes:
            - id: Batch identifier
            - herb_type: Type of herb/crop
            - harvest_date: Date of harvest
            - farmer: User model instance
            - authenticity_score: AI-generated score (0-100)
            - geo_valid: Boolean for geo validation
            - potency_score: Potency percentage
            - compliance_status: 'Approved' or other
            - blockchain_hash: Optional blockchain transaction hash
        
    Returns:
        bytes: PDF binary content ready for HTTP response
        
    Raises:
        CertificateGenerationError: If PDF generation fails
        
    Example:
        >>> pdf_bytes = generate_certificate_pdf(batch_instance)
        >>> return HttpResponse(pdf_bytes, content_type='application/pdf')
    """
    try:
        pdf_buffer = io.BytesIO()
        
        # Document setup with A4 pagesize
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            rightMargin=2.0 * cm,
            leftMargin=2.0 * cm,
            topMargin=2.0 * cm,
            bottomMargin=2.0 * cm,
            title=f'Herb Trust Certificate - Batch {batch.id}',
            author='Herb Trust Compliance Authority'
        )
        
        # Styles
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=32,
            textColor=HexColor('#1a5339'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=HexColor('#2d7a4a'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=HexColor('#1a5339'),
            spaceAfter=8,
            spaceBefore=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
        )
        
        label_style = ParagraphStyle(
            'Label',
            parent=styles['Normal'],
            fontSize=10,
            textColor=HexColor('#333333'),
            fontName='Helvetica-Bold',
            spaceAfter=2,
        )
        
        value_style = ParagraphStyle(
            'Value',
            parent=styles['Normal'],
            fontSize=10,
            textColor=HexColor('#555555'),
            spaceAfter=4,
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=9,
            textColor=HexColor('#666666'),
            alignment=TA_CENTER,
        )
        
        # Story (PDF content elements)
        story = []
        
        # Logo Section (optional)
        logo_path = None
        if settings.STATIC_ROOT:
            logo_path = Path(settings.STATIC_ROOT) / 'herb_trust_logo.png'
            if not logo_path.exists():
                logo_path = None
        
        if logo_path and os.path.exists(logo_path):
            try:
                story.append(Spacer(1, 0.3 * cm))
                logo = Image(str(logo_path), width=3.5 * cm, height=3.5 * cm)
                logo.hAlign = 'CENTER'
                story.append(logo)
                story.append(Spacer(1, 0.5 * cm))
            except Exception as e:
                logger.warning(f"Failed to load logo: {str(e)}")
                story.append(Spacer(1, 1.0 * cm))
        else:
            story.append(Spacer(1, 1.0 * cm))
        
        # Title Section
        story.append(Paragraph('HERB TRUST', title_style))
        story.append(Paragraph('CERTIFICATE OF AUTHENTICITY', subtitle_style))
        story.append(Spacer(1, 0.3 * cm))
        
        # Authority Line
        authority_text = Paragraph(
            '<b>Verified by Herb Trust Compliance Authority</b>',
            ParagraphStyle(
                'Authority', 
                parent=styles['Normal'], 
                fontSize=11, 
                alignment=TA_CENTER, 
                textColor=HexColor('#1a5339'), 
                fontName='Helvetica-Bold'
            )
        )
        story.append(authority_text)
        story.append(Spacer(1, 0.2 * cm))
        
        # Timestamp
        generated_timestamp = timezone.now().strftime('%B %d, %Y at %I:%M %p %Z')
        date_text = Paragraph(
            f'<i>Generated on {generated_timestamp}</i>',
            ParagraphStyle(
                'Date', 
                parent=styles['Normal'], 
                fontSize=8, 
                alignment=TA_CENTER, 
                textColor=HexColor('#888888')
            )
        )
        story.append(date_text)
        story.append(Spacer(1, 0.5 * cm))
        
        # Separator
        separator = Paragraph(
            '─' * 90, 
            ParagraphStyle('Line', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=HexColor('#cccccc'))
        )
        story.append(separator)
        story.append(Spacer(1, 0.5 * cm))
        
        # Batch Details Section
        story.append(Paragraph('<b>BATCH INFORMATION</b>', heading_style))
        story.append(Spacer(1, 0.3 * cm))
        
        # Safely get farmer name
        farmer_name = "Unknown"
        try:
            if hasattr(batch.farmer, 'get_full_name'):
                farmer_full_name = batch.farmer.get_full_name()
                farmer_name = farmer_full_name if farmer_full_name else batch.farmer.username
            elif hasattr(batch.farmer, 'username'):
                farmer_name = batch.farmer.username
        except Exception as e:
            logger.warning(f"Failed to get farmer name: {str(e)}")
        
        details_data = [
            [
                Paragraph('<b>Batch ID:</b>', label_style), 
                Paragraph(str(batch.id), value_style)
            ],
            [
                Paragraph('<b>Crop Name:</b>', label_style), 
                Paragraph(str(batch.herb_type), value_style)
            ],
            [
                Paragraph('<b>Harvest Date:</b>', label_style), 
                Paragraph(batch.harvest_date.strftime('%B %d, %Y'), value_style)
            ],
            [
                Paragraph('<b>Farmer:</b>', label_style), 
                Paragraph(farmer_name, value_style)
            ],
        ]
        
        # Add region if available
        if hasattr(batch, 'region') and batch.region:
            details_data.append([
                Paragraph('<b>Region:</b>', label_style),
                Paragraph(str(batch.region), value_style)
            ])
        
        details_table = Table(details_data, colWidths=[5.0 * cm, 9.5 * cm])
        details_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#f0f7f3')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ffffff'), HexColor('#f8faf7')]),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#d0d0d0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        batch_info = KeepTogether([details_table])
        story.append(batch_info)
        story.append(Spacer(1, 0.6 * cm))
        
        # Verification Scores Section
        story.append(Paragraph('<b>VERIFICATION RESULTS</b>', heading_style))
        story.append(Spacer(1, 0.3 * cm))
        
        # Format scores safely
        auth_score = f'{batch.authenticity_score:.1f}%' if batch.authenticity_score is not None else 'N/A'
        potency_val = f'{batch.potency_score:.1f}%' if batch.potency_score is not None else 'N/A'
        geo_status = '✓ Valid' if batch.geo_valid else '✗ Invalid'
        compliance_val = batch.compliance_status or 'Unknown'
        
        # Status color coding
        status_color = HexColor('#1a5339') if batch.compliance_status == 'Approved' else HexColor('#d32f2f')
        
        verification_data = [
            [
                Paragraph('<b>Authenticity Score:</b>', label_style),
                Paragraph(auth_score, value_style)
            ],
            [
                Paragraph('<b>Geo Validation:</b>', label_style),
                Paragraph(geo_status, value_style)
            ],
            [
                Paragraph('<b>Potency Score:</b>', label_style),
                Paragraph(potency_val, value_style)
            ],
            [
                Paragraph('<b>Compliance Status:</b>', label_style),
                Paragraph(compliance_val, ParagraphStyle(
                    'Status',
                    parent=value_style,
                    textColor=status_color,
                    fontName='Helvetica-Bold'
                ))
            ],
        ]
        
        verification_table = Table(verification_data, colWidths=[5.0 * cm, 9.5 * cm])
        verification_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#e8f4ed')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#f0f7f3'), HexColor('#ffffff')]),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#d0d0d0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        verification_info = KeepTogether([verification_table])
        story.append(verification_info)
        story.append(Spacer(1, 0.6 * cm))
        
        # Blockchain Hash Section
        story.append(Paragraph('<b>BLOCKCHAIN VERIFICATION</b>', heading_style))
        story.append(Spacer(1, 0.2 * cm))
        
        hash_value = batch.blockchain_hash if batch.blockchain_hash else "Pending blockchain upload"
        hash_text = Paragraph(
            f'<font size="7" face="Courier" color="#555555">{hash_value}</font>',
            ParagraphStyle('Hash', parent=styles['Normal'], alignment=TA_CENTER)
        )
        story.append(hash_text)
        story.append(Spacer(1, 0.6 * cm))
        
        # QR Code Section
        story.append(Paragraph('<b>SCAN TO VERIFY</b>', heading_style))
        story.append(Spacer(1, 0.2 * cm))
        
        # Generate verification URL or use blockchain hash
        verification_data = _get_verification_url(
            batch_id=batch.id,
            use_hash=False,  # Set to True to encode blockchain hash instead
            blockchain_hash=batch.blockchain_hash
        )
        
        # Generate QR code using helper function
        qr_buffer = _generate_qr_code(verification_data, size=300)
        
        # Embed QR code image in PDF at fixed position
        qr_image = Image(qr_buffer, width=4.5 * cm, height=4.5 * cm)
        qr_image.hAlign = 'CENTER'
        story.append(qr_image)
        
        story.append(Spacer(1, 0.3 * cm))
        
        # QR URL display
        display_url = verification_data if len(verification_data) < 80 else f"{verification_data[:77]}..."
        qr_url = Paragraph(
            f'<font size="7" color="#666666">{display_url}</font>',
            ParagraphStyle('QRUrl', parent=styles['Normal'], alignment=TA_CENTER)
        )
        story.append(qr_url)
        story.append(Spacer(1, 0.5 * cm))
        
        # Signature Section
        story.append(Spacer(1, 0.8 * cm))
        signature_line = Paragraph(
            '─' * 40,
            ParagraphStyle('SigLine', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=HexColor('#333333'))
        )
        story.append(signature_line)
        signature_label = Paragraph(
            '<font size="8"><i>Authorized Signature - Herb Trust Authority</i></font>',
            ParagraphStyle('SigLabel', parent=styles['Normal'], alignment=TA_CENTER, textColor=HexColor('#666666'))
        )
        story.append(signature_label)
        story.append(Spacer(1, 0.5 * cm))
        
        # Footer Disclaimer
        footer_text = Paragraph(
            '<i>This certificate is valid only for the batch specified above. '
            'Any unauthorized modification, reproduction, or tampering with this '
            'document is strictly prohibited and may constitute fraud.</i>',
            ParagraphStyle(
                'Footer', 
                parent=styles['Normal'], 
                alignment=TA_CENTER, 
                textColor=HexColor('#999999'), 
                fontSize=7,
                leading=10
            )
        )
        story.append(footer_text)
        
        # Build PDF document
        logger.info(f"Building PDF certificate for batch {batch.id}")
        doc.build(story)
        
        # Return PDF bytes
        pdf_buffer.seek(0)
        pdf_bytes = pdf_buffer.getvalue()
        
        logger.info(f"Successfully generated {len(pdf_bytes)} byte certificate PDF for batch {batch.id}")
        return pdf_bytes
        
    except CertificateGenerationError:
        # Re-raise our custom errors
        raise
        
    except Exception as e:
        # Catch all other errors
        logger.error(f"Certificate generation failed for batch {getattr(batch, 'id', 'unknown')}: {str(e)}", exc_info=True)
        raise CertificateGenerationError(f"Unexpected error during certificate generation: {str(e)}")
