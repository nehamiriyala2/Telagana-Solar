-- Module 3 (Follow-ups): one row per planned call / WhatsApp / visit, with outcome when done.
-- leads.next_follow_up stays and is kept equal to the earliest OPEN follow-up (the app syncs it),
-- so the sidebar badge, Pipeline and Overview keep working.
-- Who does the follow-up = the lead's owner (leads.assigned_to).

CREATE TABLE follow_ups (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id       INT UNSIGNED NOT NULL,
  due_at        DATETIME NOT NULL,                                   -- UTC
  type          ENUM('call','whatsapp','visit') NOT NULL DEFAULT 'call',
  note          VARCHAR(500) NULL,
  status        ENUM('open','done','cancelled') NOT NULL DEFAULT 'open',
  outcome       ENUM('reached','no_answer','call_back','interested','not_interested','visit_done','other') NULL,
  outcome_note  VARCHAR(500) NULL,
  done_at       DATETIME NULL,
  done_by       INT UNSIGNED NULL,
  created_by    INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL,
  KEY ix_fu_status_due (status, due_at),
  KEY ix_fu_lead (lead_id, status),
  KEY ix_fu_done (status, done_at),
  CONSTRAINT fk_fu_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_fu_done_by FOREIGN KEY (done_by) REFERENCES staff(id) ON DELETE SET NULL,
  CONSTRAINT fk_fu_created_by FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Carry over follow-up dates that were set before this table existed.
INSERT INTO follow_ups (lead_id, due_at, type, note)
  SELECT id, next_follow_up, 'call', NULL FROM leads WHERE next_follow_up IS NOT NULL AND deleted_at IS NULL;
