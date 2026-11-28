-- Anonymized leads keep their deal data but lose name/phone/message. Marking them keeps them out of the
-- "Calculator · no contact" tab (which is for leads that never had a phone).
ALTER TABLE leads ADD COLUMN anonymized_at DATETIME NULL AFTER consent_at;
