import re

class PIIRedactor:
    """
    Regex-based PII Scrubber for masking sensitive identifiers in civic intake payloads.
    Redacts SSNs, National IDs, Aadhaar numbers, phone numbers, and Tax identifiers.
    """

    # Aadhaar / 12-digit National ID pattern: 4-4-4 digits or 12 continuous digits
    AADHAAR_PATTERN = re.compile(r'\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b')
    
    # US SSN pattern: 3-2-4 digits
    SSN_PATTERN = re.compile(r'\b(\d{3})[- ]?(\d{2})[- ]?(\d{4})\b')
    
    # Standard Phone numbers (US / India / International format)
    PHONE_PATTERN = re.compile(r'\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b')
    
    # PAN / Tax ID pattern: 5 letters, 4 numbers, 1 letter
    TAX_ID_PATTERN = re.compile(r'\b([A-Z]{5})(\d{4})([A-Z]{1})\b', re.IGNORECASE)

    # Email pattern
    EMAIL_PATTERN = re.compile(r'\b([a-zA-Z0-9._%+-]{1,3})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b')

    @classmethod
    def redact_text(cls, text: str) -> str:
        if not text or not isinstance(text, str):
            return text

        # Redact 12-digit National IDs / Aadhaar (keep last 4)
        def mask_aadhaar(match):
            g3 = match.group(3)
            return f"XXXX-XXXX-{g3}"
        text = cls.AADHAAR_PATTERN.sub(mask_aadhaar, text)

        # Redact SSNs (keep last 4)
        def mask_ssn(match):
            return f"XXX-XX-{match.group(3)}"
        text = cls.SSN_PATTERN.sub(mask_ssn, text)

        # Redact Tax IDs (keep last 4)
        def mask_tax_id(match):
            return f"XXXXX{match.group(2)}*"
        text = cls.TAX_ID_PATTERN.sub(mask_tax_id, text)

        # Redact Phone Numbers
        def mask_phone(match):
            s = match.group(0)
            return s[:3] + " ***-**" + s[-2:]
        text = cls.PHONE_PATTERN.sub(mask_phone, text)

        # Redact Email
        def mask_email(match):
            prefix = match.group(1)
            domain = match.group(2)
            return f"{prefix}***@{domain}"
        text = cls.EMAIL_PATTERN.sub(mask_email, text)

        return text

    @classmethod
    def redact_dictionary(cls, data: dict) -> dict:
        """Recursively redact PII strings inside dictionaries."""
        if not isinstance(data, dict):
            return data
        
        redacted = {}
        for key, val in data.items():
            if isinstance(val, str):
                redacted[key] = cls.redact_text(val)
            elif isinstance(val, dict):
                redacted[key] = cls.redact_dictionary(val)
            elif isinstance(val, list):
                redacted[key] = [
                    cls.redact_dictionary(item) if isinstance(item, dict)
                    else (cls.redact_text(item) if isinstance(item, str) else item)
                    for item in val
                ]
            else:
                redacted[key] = val
        return redacted
