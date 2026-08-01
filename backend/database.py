import sqlite3
import json
import os
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "govflow.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        national_id TEXT,
        employee_id TEXT,
        department TEXT,
        circle_office TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Applications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        citizen_id TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        document_type TEXT NOT NULL,
        circle_office TEXT NOT NULL,
        status TEXT NOT NULL,
        overall_score REAL NOT NULL,
        badge TEXT NOT NULL,
        summary TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        inspection_matrix_json TEXT NOT NULL,
        extracted_fields_json TEXT NOT NULL,
        requires_ekyc INTEGER NOT NULL DEFAULT 0,
        ekyc_completed INTEGER NOT NULL DEFAULT 0,
        file_path TEXT,
        file_preview TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        application_id TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        document_type TEXT NOT NULL,
        circle_office TEXT NOT NULL,
        status TEXT NOT NULL,
        ekyc_used INTEGER NOT NULL DEFAULT 0,
        caseworker_action TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed Sample Regional Applications if empty
    cursor.execute("SELECT COUNT(*) as count FROM applications")
    row = cursor.fetchone()
    if row["count"] == 0:
        seed_sample_data(cursor)
        conn.commit()

    conn.close()

def seed_sample_data(cursor):
    now = datetime.now().isoformat()

    sample_apps = [
        {
            "id": "APP-2026-9041",
            "citizen_id": "CIT-101",
            "citizen_name": "Eleanor Vance",
            "document_type": "Income Certificate",
            "circle_office": "Circle Office - Zone 4",
            "status": "Pending",
            "overall_score": 0.92,
            "badge": "green",
            "summary": "Verified annual household income declaration matching W-2 records and municipal tax filings.",
            "reasoning": "High image contrast and clear text alignment across all sections. Income threshold meets state subsidy entitlement parameters.",
            "inspection_matrix": {
                "level1_ingestion_quality": {"name": "Ingestion & Quality", "status": "Pass", "score": 0.96, "details": "HD Resolution (300 DPI), zero blur, crisp edge alignment."},
                "level2_photo_identity": {"name": "Photo Identity Match", "status": "Pass", "score": 0.94, "details": "Biometric photo matches state registry with 94% facial vector similarity."},
                "level3_text_consistency": {"name": "Cross-Doc Consistency", "status": "Pass", "score": 0.91, "details": "Full name 'Eleanor Vance' matches property records exactly."},
                "level4_policy_rules": {"name": "Policy & Subsidy Compliance", "status": "Pass", "score": 0.88, "details": "Annual income $42,500 is within low-income bracket criteria."}
            },
            "extracted_fields": [
                {"field_name": "Applicant Full Name", "value": "Eleanor Vance", "confidence_score": 0.98, "badge": "green"},
                {"field_name": "Annual Household Income", "value": "$42,500.00", "confidence_score": 0.95, "badge": "green"},
                {"field_name": "Employer Name", "value": "Apex Logistics Corp", "confidence_score": 0.91, "badge": "green"},
                {"field_name": "National Identity ID", "value": "XXXX-XXXX-9041", "confidence_score": 0.89, "badge": "green"}
            ],
            "requires_ekyc": False,
            "ekyc_completed": False,
            "file_preview": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
        },
        {
            "id": "APP-2026-8812",
            "citizen_id": "CIT-102",
            "citizen_name": "Marcus Sterling",
            "document_type": "Property Tax Receipt",
            "circle_office": "Circle Office - Zone 4",
            "status": "Flagged",
            "overall_score": 0.54,
            "badge": "red",
            "summary": "Outdated photo mismatch and minor document skew detected on Property Tax Statement.",
            "reasoning": "Level 2 Photo Identity score failed (0.48 confidence). Facial features do not match baseline national registry photo. e-KYC validation recommended.",
            "inspection_matrix": {
                "level1_ingestion_quality": {"name": "Ingestion & Quality", "status": "Review", "score": 0.72, "details": "Slight corner shadow and 12-degree tilt detected on document scan."},
                "level2_photo_identity": {"name": "Photo Identity Match", "status": "Flagged", "score": 0.48, "details": "Photo mismatch: Image appears to be from an older driver's license variant."},
                "level3_text_consistency": {"name": "Cross-Doc Consistency", "status": "Pass", "score": 0.82, "details": "Tax Identification parcel number matches municipal GIS records."},
                "level4_policy_rules": {"name": "Policy & Subsidy Compliance", "status": "Review", "score": 0.65, "details": "Pending identity verification clearance."}
            },
            "extracted_fields": [
                {"field_name": "Property Owner", "value": "Marcus Sterling", "confidence_score": 0.85, "badge": "green"},
                {"field_name": "Parcel Identification No.", "value": "PARCEL-884-21A", "confidence_score": 0.78, "badge": "yellow"},
                {"field_name": "Assessment Year", "value": "2025-2026", "confidence_score": 0.90, "badge": "green"},
                {"field_name": "National Identity ID", "value": "XXXX-XXXX-8812", "confidence_score": 0.48, "badge": "red"}
            ],
            "requires_ekyc": True,
            "ekyc_completed": False,
            "file_preview": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
        },
        {
            "id": "APP-2026-7734",
            "citizen_id": "CIT-103",
            "citizen_name": "Aria Montgomery",
            "document_type": "Domicile Proof",
            "circle_office": "Circle Office - Zone 4",
            "status": "Pending",
            "overall_score": 0.74,
            "badge": "yellow",
            "summary": "Handwritten signature and slight paper crease required minor caseworker review.",
            "reasoning": "All key metadata fields extracted with medium-high confidence. Recommended caseworker quick review before issuing domicile certification.",
            "inspection_matrix": {
                "level1_ingestion_quality": {"name": "Ingestion & Quality", "status": "Review", "score": 0.68, "details": "Minor paper crease over address line 2."},
                "level2_photo_identity": {"name": "Photo Identity Match", "status": "Pass", "score": 0.86, "details": "Photo match validated against national portal."},
                "level3_text_consistency": {"name": "Cross-Doc Consistency", "status": "Pass", "score": 0.79, "details": "Residential address matches utility record within 5-year residency window."},
                "level4_policy_rules": {"name": "Policy & Subsidy Compliance", "status": "Pass", "score": 0.89, "details": "Meets 3-year minimum residency requirement for local subsidies."}
            },
            "extracted_fields": [
                {"field_name": "Applicant Full Name", "value": "Aria Montgomery", "confidence_score": 0.88, "badge": "green"},
                {"field_name": "Residential Address", "value": "742 Evergreen Terrace, Zone 4", "confidence_score": 0.72, "badge": "yellow"},
                {"field_name": "Duration of Stay", "value": "6 Years, 4 Months", "confidence_score": 0.81, "badge": "yellow"},
                {"field_name": "National Identity ID", "value": "XXXX-XXXX-7734", "confidence_score": 0.86, "badge": "green"}
            ],
            "requires_ekyc": False,
            "ekyc_completed": False,
            "file_preview": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
        },
        {
            "id": "APP-2026-6105",
            "citizen_id": "CIT-104",
            "citizen_name": "David Chen",
            "document_type": "Driver's License",
            "circle_office": "Circle Office - Zone 2",
            "status": "Issued",
            "overall_score": 0.97,
            "badge": "green",
            "summary": "Driver's License validated and official civic record issued successfully.",
            "reasoning": "Flawless document scan with cryptographic watermark verification.",
            "inspection_matrix": {
                "level1_ingestion_quality": {"name": "Ingestion & Quality", "status": "Pass", "score": 0.99, "details": "Ultra-clear scan."},
                "level2_photo_identity": {"name": "Photo Identity Match", "status": "Pass", "score": 0.98, "details": "100% photo vector alignment."},
                "level3_text_consistency": {"name": "Cross-Doc Consistency", "status": "Pass", "score": 0.96, "details": "Driver license number matches DMV registry."},
                "level4_policy_rules": {"name": "Policy & Subsidy Compliance", "status": "Pass", "score": 0.95, "details": "Active and non-expired license status."}
            },
            "extracted_fields": [
                {"field_name": "Full Name", "value": "David Chen", "confidence_score": 0.99, "badge": "green"},
                {"field_name": "License Number", "value": "DL-9083-441", "confidence_score": 0.98, "badge": "green"},
                {"field_name": "Issue Date", "value": "2024-03-15", "confidence_score": 0.96, "badge": "green"}
            ],
            "requires_ekyc": False,
            "ekyc_completed": False,
            "file_preview": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
        }
    ]

    for app in sample_apps:
        cursor.execute("""
        INSERT INTO applications (
            id, citizen_id, citizen_name, document_type, circle_office, status,
            overall_score, badge, summary, reasoning, inspection_matrix_json,
            extracted_fields_json, requires_ekyc, ekyc_completed, file_path, file_preview,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            app["id"], app["citizen_id"], app["citizen_name"], app["document_type"],
            app["circle_office"], app["status"], app["overall_score"], app["badge"],
            app["summary"], app["reasoning"], json.dumps(app["inspection_matrix"]),
            json.dumps(app["extracted_fields"]), 1 if app["requires_ekyc"] else 0,
            1 if app["ekyc_completed"] else 0, "", app["file_preview"], now, now
        ))

        # Add initial audit logs
        cursor.execute("""
        INSERT INTO audit_logs (
            id, timestamp, application_id, citizen_name, document_type,
            circle_office, status, ekyc_used, caseworker_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"LOG-{uuid.uuid4().hex[:8].upper()}", now, app["id"], app["citizen_name"],
            app["document_type"], app["circle_office"], app["status"],
            1 if app["ekyc_completed"] else 0,
            f"Initial Application Submission ({app['status']})"
        ))
