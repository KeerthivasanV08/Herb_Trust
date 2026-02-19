"""
Certificate PDF generation using reportlab.
"""
import io
import os
from pathlib import Path
import qrcode
from datetime import datetime
from django.utils import timezone
from django.conf import settings
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Rect


def generate_certificate_pdf(batch):
    """
    Generate a professional PDF certificate for an approved batch.
    
    Args:
        batch: Batch model instance
        
    Returns:
        BytesIO object containing PDF content
    """
    pdf_buffer = io.BytesIO()
    
    # Document setup
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=HexColor('#1a5339'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=HexColor('#2d7a4a'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=11,
        textColor=HexColor('#333333'),
        fontName='Helvetica-Bold',
        spaceAfter=4,
    )
    
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=11,
        textColor=HexColor('#555555'),
        spaceAfter=8,
    )
    
    # Story (content to add to PDF)
    story = []
    
    # Try to add logo if it exists
    logo_path = None
    if settings.STATIC_ROOT:
        logo_path = Path(settings.STATIC_ROOT) / 'herb_trust_logo.png'
        if not logo_path.exists():
            logo_path = None
    
    if logo_path and os.path.exists(logo_path):
        story.append(Spacer(1, 0.3 * inch))
        logo = Image(str(logo_path), width=1.5 * inch, height=1.5 * inch)
        logo.hAlign = 'CENTER'
        story.append(logo)
        story.append(Spacer(1, 0.2 * inch))
    else:
        story.append(Spacer(1, 0.5 * inch))
    
    # Title
    story.append(Paragraph('HERB TRUST CERTIFICATE', title_style))
    story.append(Paragraph('OF AUTHENTICITY', heading_style))
    story.append(Spacer(1, 0.2 * inch))
    
    # Authority line
    authority_text = Paragraph(
        '<b>Verified by Herb Trust Compliance Authority</b>',
        ParagraphStyle('Authority', parent=styles['Normal'], fontSize=11, alignment=TA_CENTER, textColor=HexColor('#1a5339'), fontName='Helvetica-Bold')
    )
    story.append(authority_text)
    story.append(Spacer(1, 0.15 * inch))
    
    # Generated timestamp
    generated_timestamp = timezone.now().strftime('%B %d, %Y at %I:%M %p %Z')
    date_text = Paragraph(
        f'<i>Generated on {generated_timestamp}</i>',
        ParagraphStyle('Date', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=HexColor('#888888'))
    )
    story.append(date_text)
    story.append(Spacer(1, 0.25 * inch))
    
    # Separator line
    story.append(Paragraph('_' * 80, ParagraphStyle('Line', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER)))
    story.append(Spacer(1, 0.2 * inch))
    
    # Certificate Details Table
    details_data = [
        [Paragraph('<b>Batch ID</b>', label_style), Paragraph(str(batch.id), value_style)],
        [Paragraph('<b>Crop Name</b>', label_style), Paragraph(batch.herb_type, value_style)],
        [Paragraph('<b>Harvest Date</b>', label_style), Paragraph(batch.harvest_date.strftime('%B %d, %Y'), value_style)],
        [Paragraph('<b>Farmer</b>', label_style), Paragraph(batch.farmer.get_full_name() or batch.farmer.username, value_style)],
    ]
    
    details_table = Table(details_data, colWidths=[2.2 * inch, 3.5 * inch])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [HexColor('#ffffff'), HexColor('#f8faf7')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(details_table)
    story.append(Spacer(1, 0.25 * inch))
    
    # Verification Scores Section
    story.append(Paragraph('<b>VERIFICATION RESULTS</b>', heading_style))
    story.append(Spacer(1, 0.15 * inch))
    
    verification_data = [
        [
            Paragraph('<b>Authenticity Score</b>', label_style),
            Paragraph(f'{batch.authenticity_score:.1f}%' if batch.authenticity_score else 'N/A', value_style)
        ],
        [
            Paragraph('<b>Geo Validation</b>', label_style),
            Paragraph('✓ Valid' if batch.geo_valid else '✗ Invalid', value_style)
        ],
        [
            Paragraph('<b>Potency Score</b>', label_style),
            Paragraph(f'{batch.potency_score:.1f}%' if batch.potency_score else 'N/A', value_style)
        ],
        [
            Paragraph('<b>Compliance Status</b>', label_style),
            Paragraph(batch.compliance_status or 'Unknown', ParagraphStyle(
                'Status',
                parent=value_style,
                textColor=HexColor('#1a5339') if batch.compliance_status == 'Approved' else HexColor('#d32f2f'),
                fontName='Helvetica-Bold'
            ))
        ],
    ]
    
    verification_table = Table(verification_data, colWidths=[2.2 * inch, 3.5 * inch])
    verification_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [HexColor('#f0f7f3'), HexColor('#ffffff')]),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(verification_table)
    story.append(Spacer(1, 0.25 * inch))
    
    # Blockchain Hash Section
    story.append(Paragraph('<b>BLOCKCHAIN VERIFICATION</b>', heading_style))
    story.append(Spacer(1, 0.1 * inch))
    
    hash_text = Paragraph(
        f'<font size="8" face="Courier">{batch.blockchain_hash or "Not available"}</font>',
        ParagraphStyle('Hash', parent=styles['Normal'], alignment=TA_CENTER, textColor=HexColor('#666666'))
    )
    story.append(hash_text)
    story.append(Spacer(1, 0.25 * inch))
    
    # QR Code
    story.append(Paragraph('<b>VERIFICATION QR CODE</b>', heading_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Load frontend URL from environment variable with fallback for local development
    frontend_base_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:5173')
    verification_url = f'{frontend_base_url}/verify/{batch.id}'
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=6,
        border=2,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color='#1a5339', back_color='white')
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    
    qr_image = Image(qr_buffer, width=1.5 * inch, height=1.5 * inch)
    qr_image.hAlign = 'CENTER'
    story.append(qr_image)
    
    story.append(Spacer(1, 0.15 * inch))
    qr_url = Paragraph(
        f'<font size="8">Scan to verify at: {verification_url}</font>',
        ParagraphStyle('QRUrl', parent=styles['Normal'], alignment=TA_CENTER, textColor=HexColor('#666666'), fontSize=8)
    )
    story.append(qr_url)
    story.append(Spacer(1, 0.3 * inch))
    
    # Signature placeholder
    story.append(Spacer(1, 0.4 * inch))
    signature_line = Paragraph(
        '_' * 40,
        ParagraphStyle('SigLine', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=HexColor('#333333'))
    )
    story.append(signature_line)
    signature_label = Paragraph(
        '<font size="9"><i>Authorized Signature</i></font>',
        ParagraphStyle('SigLabel', parent=styles['Normal'], alignment=TA_CENTER, textColor=HexColor('#666666'))
    )
    story.append(signature_label)
    story.append(Spacer(1, 0.3 * inch))
    
    # Footer
    footer_text = Paragraph(
        '<i>This certificate is valid only for the batch specified above. Tampering with this document is prohibited.</i>',
        ParagraphStyle('Footer', parent=styles['Normal'], alignment=TA_CENTER, textColor=HexColor('#999999'), fontSize=9)
    )
    story.append(footer_text)
    
    # Build PDF
    doc.build(story)
    pdf_buffer.seek(0)
    
    return pdf_buffer.getvalue()
