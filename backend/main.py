import os
import json
import csv
import io
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, get_db_connection
from models import (
    CitizenAuthRequest, CaseworkerAuthRequest, UserProfileResponse,
    ApplicationResponse, EkycVerificationRequest, ActionApproveRequest,
    NoticeGenerateRequest, NoticeGenerateResponse, AuditLogEntry
)
from services.gemini import GeminiExtractionService
from utils.pii import PIIRedactor

app = FastAPI(
    title="GovFlow Copilot API",
    description="Enterprise Civic Document Intake & AI Caseworker Copilot API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "GovFlow Copilot API", "timestamp": datetime.now().isoformat()}

# ------------------------------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# ------------------------------------------------------------------------------
@app.post("/api/auth/citizen", response_model=UserProfileResponse)
def citizen_auth(req: CitizenAuthRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Redact PII before storing
    redacted_national_id = PIIRedactor.redact_text(req.national_id)
    redacted_email = PIIRedactor.redact_text(req.email)
    redacted_phone = PIIRedactor.redact_text(req.phone)

    user_id = f"CIT-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now().isoformat()

    cursor.execute("SELECT * FROM users WHERE email = ?", (redacted_email,))
    existing = cursor.fetchone()

    if existing:
        return UserProfileResponse(
            id=existing["id"],
            role="citizen",
            full_name=existing["full_name"],
            email=existing["email"],
            circle_office=existing["circle_office"],
            details={
                "address": existing["phone"],
                "national_id": existing["national_id"],
                "phone": existing["phone"]
            }
        )

    cursor.execute("""
    INSERT INTO users (id, role, full_name, email, phone, national_id, circle_office, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, "citizen", req.full_name, redacted_email, redacted_phone, redacted_national_id, req.circle_office, now))
    
    conn.commit()
    conn.close()

    return UserProfileResponse(
        id=user_id,
        role="citizen",
        full_name=req.full_name,
        email=redacted_email,
        circle_office=req.circle_office,
        details={
            "address": req.address,
            "national_id": redacted_national_id,
            "phone": redacted_phone
        }
    )

@app.post("/api/auth/caseworker", response_model=UserProfileResponse)
def caseworker_auth(req: CaseworkerAuthRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    user_id = f"CW-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now().isoformat()

    cursor.execute("SELECT * FROM users WHERE employee_id = ?", (req.employee_id,))
    existing = cursor.fetchone()

    if existing:
        return UserProfileResponse(
            id=existing["id"],
            role="caseworker",
            full_name=existing["full_name"],
            email=existing["email"],
            circle_office=existing["circle_office"],
            details={
                "employee_id": existing["employee_id"],
                "department": existing["department"]
            }
        )

    email = f"{req.employee_id.lower()}@govflow.state.gov"
    cursor.execute("""
    INSERT INTO users (id, role, full_name, email, employee_id, department, circle_office, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, "caseworker", req.official_name, email, req.employee_id, req.department, req.circle_office, now))

    conn.commit()
    conn.close()

    return UserProfileResponse(
        id=user_id,
        role="caseworker",
        full_name=req.official_name,
        email=email,
        circle_office=req.circle_office,
        details={
            "employee_id": req.employee_id,
            "department": req.department
        }
    )

# ------------------------------------------------------------------------------
# APPLICATION INTAKE & MANAGEMENT ENDPOINTS
# ------------------------------------------------------------------------------
@app.get("/api/applications")
def get_applications(
    circle_office: Optional[str] = None,
    status: Optional[str] = None,
    doc_type: Optional[str] = None,
    citizen_id: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM applications WHERE 1=1"
    params = []

    if circle_office:
        query += " AND circle_office = ?"
        params.append(circle_office)
    if status:
        query += " AND status = ?"
        params.append(status)
    if doc_type:
        query += " AND document_type = ?"
        params.append(doc_type)
    if citizen_id:
        query += " AND citizen_id = ?"
        params.append(citizen_id)

    query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    results = []
    for r in rows:
        matrix = json.loads(r["inspection_matrix_json"])
        fields = json.loads(r["extracted_fields_json"])
        results.append({
            "id": r["id"],
            "citizen_id": r["citizen_id"],
            "citizen_name": r["citizen_name"],
            "document_type": r["document_type"],
            "circle_office": r["circle_office"],
            "status": r["status"],
            "overall_score": r["overall_score"],
            "badge": r["badge"],
            "summary": r["summary"],
            "reasoning": r["reasoning"],
            "inspection_matrix": matrix,
            "extracted_fields": fields,
            "requires_ekyc": bool(r["requires_ekyc"]),
            "ekyc_completed": bool(r["ekyc_completed"]),
            "file_path": r["file_path"],
            "file_preview": r["file_preview"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        })

    conn.close()
    return results

@app.post("/api/applications/upload")
async def upload_document(
    file: UploadFile = File(...),
    citizen_id: str = Form(...),
    citizen_name: str = Form(...),
    document_type: str = Form(...),
    circle_office: str = Form(...)
):
    contents = await file.read()
    
    # Run Gemini Vision Analysis Engine
    extraction = GeminiExtractionService.analyze_document_image(
        image_bytes=contents,
        file_name=file.filename or "uploaded_doc.png",
        requested_doc_type=document_type
    )

    app_id = f"APP-2026-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.now().isoformat()

    badge = "green" if extraction.overall_confidence >= 0.85 else ("yellow" if extraction.overall_confidence >= 0.60 else "red")
    status = "Pending" if extraction.overall_confidence >= 0.60 else "Flagged"

    conn = get_db_connection()
    cursor = conn.cursor()

    # Base64 data URL for instant image preview in UI
    import base64
    b64_str = base64.b64encode(contents).decode("utf-8")
    mime_type = file.content_type or "image/png"
    file_preview = f"data:{mime_type};base64,{b64_str[:1000]}..." # Or store full data URL

    matrix_dict = extraction.inspection_matrix.dict()
    fields_dict = [f.dict() for f in extraction.extracted_fields]

    cursor.execute("""
    INSERT INTO applications (
        id, citizen_id, citizen_name, document_type, circle_office, status,
        overall_score, badge, summary, reasoning, inspection_matrix_json,
        extracted_fields_json, requires_ekyc, ekyc_completed, file_path, file_preview,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        app_id, citizen_id, citizen_name, extraction.document_type, circle_office,
        status, extraction.overall_confidence, badge, extraction.summary,
        extraction.reasoning, json.dumps(matrix_dict), json.dumps(fields_dict),
        1 if extraction.requires_ekyc else 0, 0, file.filename,
        f"data:{mime_type};base64,{b64_str}", now, now
    ))

    # Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (
        id, timestamp, application_id, citizen_name, document_type,
        circle_office, status, ekyc_used, caseworker_action
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"LOG-{uuid.uuid4().hex[:8].upper()}", now, app_id, citizen_name,
        extraction.document_type, circle_office, status, 0,
        f"Document Upload & Gemini Extraction ({badge.upper()} badge)"
    ))

    conn.commit()
    conn.close()

    return {
        "id": app_id,
        "citizen_id": citizen_id,
        "citizen_name": citizen_name,
        "document_type": extraction.document_type,
        "circle_office": circle_office,
        "status": status,
        "overall_score": extraction.overall_confidence,
        "badge": badge,
        "summary": extraction.summary,
        "reasoning": extraction.reasoning,
        "inspection_matrix": matrix_dict,
        "extracted_fields": fields_dict,
        "requires_ekyc": extraction.requires_ekyc,
        "ekyc_completed": False,
        "file_preview": f"data:{mime_type};base64,{b64_str}",
        "created_at": now,
        "updated_at": now
    }

# ------------------------------------------------------------------------------
# e-KYC DIGILOCKER VERIFICATION FALLBACK ENDPOINT
# ------------------------------------------------------------------------------
@app.post("/api/applications/{app_id}/ekyc")
def verify_ekyc(app_id: str, req: EkycVerificationRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    app_row = cursor.fetchone()

    if not app_row:
        raise HTTPException(status_code=404, detail="Application not found")

    matrix = json.loads(app_row["inspection_matrix_json"])
    fields = json.loads(app_row["extracted_fields_json"])

    # Override Level 2 Identity Flag to Verified via DigiLocker
    matrix["level2_photo_identity"] = {
        "name": "Photo Identity Match",
        "status": "Verified via DigiLocker",
        "score": 0.98,
        "details": f"Identity verified via OTP session (DigiLocker Demographic Lock). National ID: {PIIRedactor.redact_text(req.national_id)}"
    }

    # Update Level 4 Policy status to Pass
    matrix["level4_policy_rules"]["status"] = "Pass"
    matrix["level4_policy_rules"]["score"] = 0.95

    now = datetime.now().isoformat()
    new_score = 0.95
    new_badge = "green"
    new_status = "Pending" # Ready for caseworker approval

    cursor.execute("""
    UPDATE applications
    SET overall_score = ?, badge = ?, status = ?, inspection_matrix_json = ?,
        requires_ekyc = 0, ekyc_completed = 1, reasoning = ?, updated_at = ?
    WHERE id = ?
    """, (
        new_score, new_badge, new_status, json.dumps(matrix),
        "Identity flag cleared via DigiLocker e-KYC OTP verification.", now, app_id
    ))

    # Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (
        id, timestamp, application_id, citizen_name, document_type,
        circle_office, status, ekyc_used, caseworker_action
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"LOG-{uuid.uuid4().hex[:8].upper()}", now, app_id, app_row["citizen_name"],
        app_row["document_type"], app_row["circle_office"], new_status, 1,
        "DigiLocker e-KYC Verification Completed (Cleared Identity Flag)"
    ))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": "Identity flag successfully cleared via DigiLocker e-KYC.",
        "application_id": app_id,
        "new_badge": new_badge,
        "new_status": new_status,
        "inspection_matrix": matrix
    }

# ------------------------------------------------------------------------------
# CASEWORKER ACTIONS: APPROVE & ISSUE / NOTICE GENERATION
# ------------------------------------------------------------------------------
@app.post("/api/applications/{app_id}/approve")
def approve_application(app_id: str, req: ActionApproveRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    app_row = cursor.fetchone()

    if not app_row:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.now().isoformat()
    cursor.execute("""
    UPDATE applications
    SET status = 'Issued', updated_at = ?
    WHERE id = ?
    """, (now, app_id))

    # Audit Log
    cursor.execute("""
    INSERT INTO audit_logs (
        id, timestamp, application_id, citizen_name, document_type,
        circle_office, status, ekyc_used, caseworker_action
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"LOG-{uuid.uuid4().hex[:8].upper()}", now, app_id, app_row["citizen_name"],
        app_row["document_type"], app_row["circle_office"], "Issued",
        app_row["ekyc_completed"], f"Caseworker ({req.caseworker_id}) Approved & Issued Official Document"
    ))

    conn.commit()
    conn.close()

    return {"status": "success", "application_id": app_id, "new_status": "Issued"}

@app.post("/api/applications/{app_id}/notice", response_model=NoticeGenerateResponse)
def generate_citizen_notice(app_id: str, req: NoticeGenerateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM applications WHERE id = ?", (app_id,))
    app_row = cursor.fetchone()

    if not app_row:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.now().isoformat()
    citizen_name = app_row["citizen_name"]
    doc_type = app_row["document_type"]
    reasoning = app_row["reasoning"]

    subject = f"Action Required: Your {doc_type} Application ({app_id})"
    email_text = f"""Dear {citizen_name},

Regarding your recent intake submission for {doc_type} (Ref: {app_id}) at {app_row['circle_office']}:

Our AI Caseworker Copilot and Circle Office officials have reviewed your document:
Reasoning: {reasoning}

{req.custom_instructions or 'Please complete DigiLocker e-KYC verification or re-upload a high-resolution, un-cropped scan with clear lighting.'}

Sincerely,
GovFlow Copilot Intake Team
{app_row['circle_office']}"""

    sms_text = f"GovFlow Alert ({app_id}): Action required on your {doc_type}. Log in to complete e-KYC or re-upload photo."

    return NoticeGenerateResponse(
        application_id=app_id,
        recipient_name=citizen_name,
        recipient_email=f"{citizen_name.lower().replace(' ', '.')}@citizen.gov",
        recipient_phone="+1 (555) ***-**41",
        subject=subject,
        notice_text=email_text,
        sms_text=sms_text,
        created_at=now
    )

# ------------------------------------------------------------------------------
# AUDIT LOGS & CSV EXPORT
# ------------------------------------------------------------------------------
@app.get("/api/audit-logs", response_model=List[AuditLogEntry])
def get_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC")
    rows = cursor.fetchall()

    logs = []
    for r in rows:
        logs.append(AuditLogEntry(
            id=r["id"],
            timestamp=r["timestamp"],
            application_id=r["application_id"],
            citizen_name=r["citizen_name"],
            document_type=r["document_type"],
            circle_office=r["circle_office"],
            status=r["status"],
            ekyc_used=bool(r["ekyc_used"]),
            caseworker_action=r["caseworker_action"]
        ))

    conn.close()
    return logs

@app.get("/api/audit-logs/export")
def export_audit_csv():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Audit Log ID", "Timestamp", "Application ID", "Citizen Name",
        "Document Type", "Circle Office Jurisdiction", "Status",
        "e-KYC Fallback Used", "Caseworker Action"
    ])

    for r in rows:
        writer.writerow([
            r["id"], r["timestamp"], r["application_id"], r["citizen_name"],
            r["document_type"], r["circle_office"], r["status"],
            "Yes" if r["ekyc_used"] else "No", r["caseworker_action"]
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=GovFlow_Audit_Log_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
