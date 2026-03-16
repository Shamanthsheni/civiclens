"""
create_test_docs.py
Generates two realistic PDF documents for testing the CivicLens /analyze endpoint.
Run: python create_test_docs.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import os

# Ensure uploads/ folder exists
os.makedirs("uploads", exist_ok=True)

# ── Shared styles ──────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def style(name="Normal", **kwargs):
    base = ParagraphStyle(name, parent=styles[name], **kwargs)
    return base


# ══════════════════════════════════════════════════════════════════════════════
# Document 1 — Rejection Letter
# ══════════════════════════════════════════════════════════════════════════════
def build_rejection_letter():
    path = "uploads/rejection_letter.pdf"
    doc = SimpleDocTemplate(
        path,
        pagesize=A4,
        leftMargin=3 * cm,
        rightMargin=3 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    body = []

    # ── Header block ──
    body.append(Paragraph(
        "<b>BRUHAT BENGALURU MAHANAGARA PALIKE (BBMP)</b>",
        style("Normal", fontSize=13, alignment=TA_CENTER, spaceAfter=2)
    ))
    body.append(Paragraph(
        "Building Plan Approval Department",
        style("Normal", fontSize=11, alignment=TA_CENTER, spaceAfter=2)
    ))
    body.append(Paragraph(
        "No. 2, Sampige Road, Malleshwaram, Bengaluru – 560012",
        style("Normal", fontSize=9, alignment=TA_CENTER, spaceAfter=6)
    ))
    body.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A5F")))
    body.append(Spacer(1, 0.4 * cm))

    # ── Date & Ref ──
    date_ref_data = [
        [
            Paragraph("Date: <b>14 February 2026</b>", style("Normal", fontSize=9)),
            Paragraph("Reference No: <b>BBMP/BP/2026/7742</b>",
                      style("Normal", fontSize=9, alignment=TA_RIGHT)),
        ]
    ]
    date_ref_table = Table(date_ref_data, colWidths=["50%", "50%"])
    date_ref_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
    ]))
    body.append(date_ref_table)
    body.append(Spacer(1, 0.6 * cm))

    # ── Addressee ──
    body.append(Paragraph("To,", style("Normal", fontSize=10)))
    body.append(Paragraph("Mr. Rajesh Kumar", style("Normal", fontSize=10)))
    body.append(Paragraph("No. 45, 3rd Cross, Indiranagar",
                           style("Normal", fontSize=10)))
    body.append(Paragraph("Bengaluru – 560038",
                           style("Normal", fontSize=10, spaceAfter=12)))

    # ── Subject ──
    body.append(Paragraph(
        "<b>Subject: Rejection of Building Plan Application</b>",
        style("Normal", fontSize=10, spaceAfter=12)
    ))

    # ── Salutation ──
    body.append(Paragraph("Dear Applicant,", style("Normal", fontSize=10, spaceAfter=8)))

    # ── Body ──
    body.append(Paragraph(
        "With reference to your building plan application dated <b>10 January 2026</b>, "
        "we regret to inform you that your application has been <b>rejected</b>.",
        style("Normal", fontSize=10, leading=16, spaceAfter=12, alignment=TA_JUSTIFY)
    ))

    body.append(Paragraph(
        "<b>Reason for Rejection:</b> The plan does not meet the required standards "
        "and regulations.",
        style("Normal", fontSize=10, leading=16, spaceAfter=12,
              backColor=colors.HexColor("#FFF8E1"),
              borderPadding=(6, 6, 6, 6))
    ))

    body.append(Paragraph(
        "You are advised to rectify the deficiencies and resubmit your application.",
        style("Normal", fontSize=10, leading=16, spaceAfter=24, alignment=TA_JUSTIFY)
    ))

    # ── Sign-off ──
    body.append(Paragraph("Yours faithfully,", style("Normal", fontSize=10, spaceAfter=40)))
    body.append(HRFlowable(width=6 * cm, thickness=0.5, color=colors.grey))
    body.append(Paragraph("<b>Executive Engineer</b>",
                           style("Normal", fontSize=10, spaceAfter=2)))
    body.append(Paragraph("BBMP Building Plan Approval Department",
                           style("Normal", fontSize=10)))

    # ── Official stamp note ──
    body.append(Spacer(1, 1.2 * cm))
    body.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
    body.append(Paragraph(
        "<i>This is a computer-generated document. For queries contact: "
        "bbmp.bpad@bbmp.gov.in | Helpline: 080-2266-0000</i>",
        style("Normal", fontSize=7.5, textColor=colors.grey, alignment=TA_CENTER, spaceBefore=4)
    ))

    doc.build(body)
    print(f"Created: {path}")


# ══════════════════════════════════════════════════════════════════════════════
# Document 2 — Building Permit Application
# ══════════════════════════════════════════════════════════════════════════════
def build_application():
    path = "uploads/application.pdf"
    doc = SimpleDocTemplate(
        path,
        pagesize=A4,
        leftMargin=3 * cm,
        rightMargin=3 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    body = []
    blue = colors.HexColor("#1E3A5F")

    # ── Header ──
    body.append(Paragraph(
        "<b>APPLICATION FOR BUILDING PLAN APPROVAL</b>",
        style("Normal", fontSize=13, alignment=TA_CENTER, spaceAfter=2, textColor=blue)
    ))
    body.append(Paragraph(
        "Bruhat Bengaluru Mahanagara Palike",
        style("Normal", fontSize=10, alignment=TA_CENTER, spaceAfter=6)
    ))
    body.append(HRFlowable(width="100%", thickness=1.5, color=blue))
    body.append(Spacer(1, 0.4 * cm))

    # ── Addressing ──
    body.append(Paragraph("To,", style("Normal", fontSize=10)))
    body.append(Paragraph("The Executive Engineer",
                           style("Normal", fontSize=10)))
    body.append(Paragraph("BBMP Building Plan Approval Department",
                           style("Normal", fontSize=10)))
    body.append(Paragraph("Bengaluru", style("Normal", fontSize=10, spaceAfter=10)))

    # ── Date & App No ──
    meta = [
        [Paragraph("Date: <b>10 January 2026</b>", style("Normal", fontSize=9)),
         Paragraph("Application No: <b>BBMP/BP/2026/7742</b>",
                   style("Normal", fontSize=9, alignment=TA_RIGHT))],
    ]
    meta_table = Table(meta, colWidths=["50%", "50%"])
    meta_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    body.append(meta_table)
    body.append(Spacer(1, 0.5 * cm))

    def section_header(title):
        body.append(Paragraph(
            f"<b>{title}</b>",
            style("Normal", fontSize=10, textColor=blue, spaceBefore=8, spaceAfter=4,
                  borderPadding=(3, 3, 3, 3))
        ))
        body.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#dee2e6")))

    def field(label, value):
        body.append(Table(
            [[Paragraph(label, style("Normal", fontSize=9, textColor=colors.grey)),
              Paragraph(f"<b>{value}</b>", style("Normal", fontSize=9.5))]],
            colWidths=["35%", "65%"],
        ))

    # ── Applicant Details ──
    section_header("Applicant Details")
    field("Name:", "Rajesh Kumar")
    field("Address:", "No. 45, 3rd Cross, Indiranagar, Bengaluru – 560038")
    field("Phone:", "9845012345")
    body.append(Spacer(1, 0.3 * cm))

    # ── Site Details ──
    section_header("Site Details")
    field("Site Address:", "No. 12, 5th Main, HSR Layout, Bengaluru – 560102")
    field("Site Area:", "1200 sq ft")
    field("Proposed Use:", "Residential")
    body.append(Spacer(1, 0.3 * cm))

    # ── Building Details ──
    section_header("Building Details")
    field("Number of Floors:", "2")
    field("Total Height:", "8 meters")
    field("Floor Space Index (FSI):", "1.4")
    field("Setback from boundary:", "3.5 meters")
    body.append(Spacer(1, 0.3 * cm))

    # ── Documents Submitted ──
    section_header("Documents Submitted")
    docs = [
        "Site Plan – Attached",
        "Title Deed – Attached",
        "Structural Stability Certificate – Attached",
        "Fire NOC – Attached",
    ]
    for d in docs:
        body.append(Paragraph(
            f"✓  {d}",
            style("Normal", fontSize=9.5, leftIndent=10, spaceAfter=3)
        ))
    body.append(Spacer(1, 0.5 * cm))

    # ── Declaration ──
    body.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#dee2e6")))
    body.append(Paragraph(
        "I hereby declare that all information provided is true and correct.",
        style("Normal", fontSize=10, leading=16, spaceAfter=20, spaceBefore=8,
              alignment=TA_JUSTIFY)
    ))

    # ── Signature ──
    sig_data = [
        [Paragraph("Signature: <b>Rajesh Kumar</b>", style("Normal", fontSize=10)),
         Paragraph("Date: <b>10 January 2026</b>",
                   style("Normal", fontSize=10, alignment=TA_RIGHT))],
    ]
    sig_table = Table(sig_data, colWidths=["55%", "45%"])
    sig_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "BOTTOM")]))
    body.append(sig_table)

    # ── Footer ──
    body.append(Spacer(1, 1 * cm))
    body.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
    body.append(Paragraph(
        "<i>For office use only — Received by: _____________  Date: _____________  "
        "Verification Status: _____________</i>",
        style("Normal", fontSize=7.5, textColor=colors.grey, alignment=TA_CENTER, spaceBefore=4)
    ))

    doc.build(body)
    print(f"Created: {path}")


if __name__ == "__main__":
    build_rejection_letter()
    build_application()
    print("\nDone. Both PDFs are in the uploads/ folder.")
    print("Test with: curl -X POST http://localhost:5000/analyze -F rejection_letter=@uploads/rejection_letter.pdf -F application_doc=@uploads/application.pdf")
