-- Module 1 (Leads): contact fields for leads added by staff, a Content role, and who created a lead.
-- Additive only: no existing column or row is dropped or changed.

ALTER TABLE staff MODIFY COLUMN role ENUM('admin','sales','installer','content') NOT NULL DEFAULT 'sales';

ALTER TABLE leads
  ADD COLUMN alt_phone            VARCHAR(30)  NULL AFTER phone_normalized,
  ADD COLUMN alt_phone_normalized CHAR(10)     NULL AFTER alt_phone,
  ADD COLUMN email                VARCHAR(190) NULL AFTER alt_phone_normalized,
  ADD COLUMN address              VARCHAR(255) NULL AFTER place,
  ADD COLUMN roof_area_sqft       INT UNSIGNED NULL AFTER roof,
  ADD COLUMN created_by           INT UNSIGNED NULL AFTER is_test,  -- staff who added it by hand (NULL = website)
  ADD KEY ix_leads_alt_phone (alt_phone_normalized),
  ADD CONSTRAINT fk_leads_created_by FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL;
