from pydantic import BaseModel, Field
from typing import List, Optional

class InspectionLevel(BaseModel):
    name: str
    status: str  # "Pass" | "Review" | "Flagged" | "Verified via DigiLocker"
    score: float  # 0.0 to 1.0
    details: str

class InspectionMatrix(BaseModel):
    level1_ingestion_quality: InspectionLevel
    level2_photo_identity: InspectionLevel
    level3_text_consistency: InspectionLevel
    level4_policy_rules: InspectionLevel

class ExtractedField(BaseModel):
    field_name: str
    value: str
    confidence_score: float  # 0.0 to 1.0
    badge: str  # "green" | "yellow" | "red"

class DocumentExtractionResult(BaseModel):
    document_type: str
    extracted_fields: List[ExtractedField]
    summary: str
    reasoning: str
    overall_confidence: float
    inspection_matrix: InspectionMatrix
    requires_ekyc: bool

# Auth Models
class CitizenAuthRequest(BaseModel):
    full_name: str
    address: str
    email: str
    phone: str
    national_id: str
    circle_office: str

class CaseworkerAuthRequest(BaseModel):
    official_name: str
    employee_id: str
    department: str
    circle_office: str

class UserProfileResponse(BaseModel):
    id: str
    role: str  # "citizen" | "caseworker"
    full_name: str
    email: str
    circle_office: str
    details: dict

# Application Models
class ApplicationCreate(BaseModel):
    citizen_id: str
    citizen_name: str
    document_type: str
    circle_office: str
    notes: Optional[str] = ""

class ApplicationResponse(BaseModel):
    id: str
    citizen_id: str
    citizen_name: str
    document_type: str
    circle_office: str
    status: str  # "Pending", "Approved", "Flagged", "Issued", "Rejected"
    overall_score: float
    badge: str  # "green", "yellow", "red"
    summary: str
    reasoning: str
    inspection_matrix: InspectionMatrix
    extracted_fields: List[ExtractedField]
    requires_ekyc: bool
    ekyc_completed: bool
    file_path: Optional[str] = ""
    file_preview: Optional[str] = ""
    created_at: str
    updated_at: str

class EkycVerificationRequest(BaseModel):
    application_id: str
    otp: str
    national_id: str

class ActionApproveRequest(BaseModel):
    application_id: str
    caseworker_id: str
    caseworker_notes: Optional[str] = ""

class NoticeGenerateRequest(BaseModel):
    application_id: str
    notice_type: str  # "Email" | "SMS" | "Official Letter"
    custom_instructions: Optional[str] = ""

class NoticeGenerateResponse(BaseModel):
    application_id: str
    recipient_name: str
    recipient_email: str
    recipient_phone: str
    subject: str
    notice_text: str
    sms_text: str
    created_at: str

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    application_id: str
    citizen_name: str
    document_type: str
    circle_office: str
    status: str
    ekyc_used: bool
    caseworker_action: str
