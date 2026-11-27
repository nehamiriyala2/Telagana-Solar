-- Admin actions that are not about one lead or one setting: report downloads, team changes, invites.
-- Shown in Settings → Audit (Step 6) together with settings_history and lead_activity.
CREATE TABLE admin_audit (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  staff_id    INT UNSIGNED NULL,
  action      VARCHAR(40) NOT NULL,        -- report_exported | staff_invited | staff_role_changed | staff_activated | staff_deactivated | leads_reassigned
  target      VARCHAR(120) NULL,           -- e.g. staff:12, report:by-source
  details     JSON NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_audit_created (created_at),
  CONSTRAINT fk_audit_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
