-- Telangana Solar admin: initial schema.
-- MySQL 8 / MariaDB 10.4+ · InnoDB · utf8mb4_unicode_ci (Telugu-safe).
-- All DATETIME values are UTC (the app sets time_zone = '+00:00' on every connection);
-- the admin UI converts to Asia/Kolkata for display.

CREATE TABLE districts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(60)  NOT NULL,
  name_en      VARCHAR(120) NOT NULL,
  name_te      VARCHAR(120) NOT NULL,
  discom       ENUM('TGSPDCL','TGNPDCL') NOT NULL,
  region       VARCHAR(60)  NULL,
  summary_en   TEXT NULL,
  summary_te   TEXT NULL,
  hero_image   VARCHAR(255) NULL,
  published    TINYINT(1) NOT NULL DEFAULT 1,
  sort_order   INT NOT NULL DEFAULT 0,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_districts_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE staff (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  role           ENUM('admin','sales','installer') NOT NULL DEFAULT 'sales',
  active         TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at  DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_staff_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leads (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_no          VARCHAR(20) NULL,                 -- TS-0001, set by the app right after insert
  public_id        CHAR(36) NULL,                    -- id the website gave the lead (Sheet / "mark called" links)
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Website fields ("timestamp" is submitted_at; "use" is use_type)
  submitted_at     DATETIME NULL,
  source           VARCHAR(40)  NULL,                -- find-my-plan | contact | savings-calculator | shop-calculator | subsidy-check
  kind             VARCHAR(30)  NULL,                -- raw website form kind
  name             VARCHAR(120) NULL,
  phone            VARCHAR(30)  NULL,                -- as typed
  area             VARCHAR(160) NULL,
  place            VARCHAR(160) NULL,
  use_type         VARCHAR(20)  NULL,                -- home | apartment | shop | farm | institution
  bill             INT UNSIGNED NULL,                -- ₹ per month
  units            INT UNSIGNED NULL,                -- kWh per month
  power_cuts       TINYINT(1) NULL,
  roof             VARCHAR(20)  NULL,                -- own | shared | none
  kw               DECIMAL(6,2) NULL,
  system_type      VARCHAR(20)  NULL,                -- on-grid | hybrid | off-grid
  monthly_saving   INT UNSIGNED NULL,                -- ₹ shown on the website
  schemes          JSON NULL,                        -- array of scheme slugs
  message          TEXT NULL,
  lang             CHAR(2) NULL,                     -- en | te
  page             VARCHAR(255) NULL,
  package_id       VARCHAR(40) NULL,
  calc             JSON NULL,                        -- full calculator summary the website showed
  raw              JSON NULL,                        -- the payload exactly as received (raw text kept)

  district_id      INT UNSIGNED NULL,
  phone_normalized CHAR(10) NULL,

  -- Deal
  status           ENUM('new','contacted','site_visit','quote_sent','won','lost') NOT NULL DEFAULT 'new',
  assigned_to      INT UNSIGNED NULL,
  next_follow_up   DATETIME NULL,
  site_visit_at    DATETIME NULL,
  final_kw         DECIMAL(6,2) NULL,
  quote_amount     INT UNSIGNED NULL,
  subsidy_applied  TINYINT(1) NULL,
  loan_needed      TINYINT(1) NULL,
  won_at           DATETIME NULL,
  install_date     DATE NULL,
  lost_reason      ENUM('price','roof_not_suitable','went_elsewhere','no_reply','other') NULL,
  first_contacted_at DATETIME NULL,

  -- Attribution / privacy
  utm_source       VARCHAR(120) NULL,
  utm_campaign     VARCHAR(160) NULL,
  referrer         VARCHAR(255) NULL,
  consent_at       DATETIME NULL,

  is_test          TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at       DATETIME NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_leads_lead_no (lead_no),
  KEY ix_leads_created (created_at),
  KEY ix_leads_status (status),
  KEY ix_leads_source (source),
  KEY ix_leads_district (district_id),
  KEY ix_leads_assigned (assigned_to),
  KEY ix_leads_phone (phone_normalized),
  KEY ix_leads_follow_up (next_follow_up),
  CONSTRAINT fk_leads_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
  CONSTRAINT fk_leads_staff FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lead_notes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id     INT UNSIGNED NOT NULL,
  staff_id    INT UNSIGNED NULL,
  body        TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NULL,
  KEY ix_notes_lead (lead_id),
  CONSTRAINT fk_notes_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lead_activity (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id     INT UNSIGNED NOT NULL,
  staff_id    INT UNSIGNED NULL,                     -- NULL = system
  action      VARCHAR(40) NOT NULL,                  -- created | email_sent | whatsapp_sent | status_changed | assigned | note_added | field_edited | merged | exported | ...
  details     JSON NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_activity_lead (lead_id, created_at),
  KEY ix_activity_created (created_at),
  CONSTRAINT fk_activity_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE otp_codes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(190) NOT NULL,
  code_hash   CHAR(64) NOT NULL,
  expires_at  DATETIME NOT NULL,
  attempts    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used_at     DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_otp_email (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id          CHAR(64) PRIMARY KEY,
  staff_id    INT UNSIGNED NOT NULL,
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_sessions_staff (staff_id),
  CONSTRAINT fk_sessions_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rate_limits (
  `key`        VARCHAR(190) PRIMARY KEY,
  count        INT UNSIGNED NOT NULL DEFAULT 0,
  window_start DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settings (
  `key`       VARCHAR(80) PRIMARY KEY,
  value       JSON NOT NULL,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_staff FOREIGN KEY (updated_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settings_history (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key`       VARCHAR(80) NOT NULL,
  old_value   JSON NULL,
  new_value   JSON NULL,
  changed_by  INT UNSIGNED NULL,
  changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_settings_history_key (`key`, changed_at),
  CONSTRAINT fk_settings_history_staff FOREIGN KEY (changed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schemes (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug              VARCHAR(60) NOT NULL,
  name_en           VARCHAR(160) NOT NULL,
  name_te           VARCHAR(160) NOT NULL,
  summary_en        TEXT NULL,
  summary_te        TEXT NULL,
  eligibility_en    TEXT NULL,
  eligibility_te    TEXT NULL,
  benefit_text      TEXT NULL,
  documents         JSON NULL,
  steps             JSON NULL,
  official_url      VARCHAR(255) NULL,
  last_verified_at  DATETIME NULL,
  status            ENUM('draft','published','needs_review') NOT NULL DEFAULT 'draft',
  deleted_at        DATETIME NULL,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_schemes_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE scheme_districts (
  scheme_id    INT UNSIGNED NOT NULL,
  district_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (scheme_id, district_id),
  CONSTRAINT fk_sd_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE,
  CONSTRAINT fk_sd_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE packages (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en        VARCHAR(120) NOT NULL,
  name_te        VARCHAR(120) NOT NULL,
  starting_from  INT UNSIGNED NULL,
  features_en    JSON NULL,
  features_te    JSON NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  published      TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at     DATETIME NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faqs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_en  TEXT NOT NULL,
  question_te  TEXT NOT NULL,
  answer_en    TEXT NOT NULL,
  answer_te    TEXT NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  published    TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at   DATETIME NULL,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonials (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  district_id  INT UNSIGNED NULL,
  text_en      TEXT NULL,
  text_te      TEXT NULL,
  approved     TINYINT(1) NOT NULL DEFAULT 0,
  sort_order   INT NOT NULL DEFAULT 0,
  deleted_at   DATETIME NULL,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_testimonials_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projects (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(160) NOT NULL,
  district_id          INT UNSIGNED NULL,
  area                 VARCHAR(160) NULL,
  type                 ENUM('home','shop','apartment','farm') NOT NULL DEFAULT 'home',
  kw                   DECIMAL(6,2) NULL,
  system_type          VARCHAR(20) NULL,
  bill_before          INT UNSIGNED NULL,
  bill_after           INT UNSIGNED NULL,
  monthly_units        INT UNSIGNED NULL,
  story_en             TEXT NULL,
  story_te             TEXT NULL,
  customer_permission  TINYINT(1) NOT NULL DEFAULT 0,
  show_on              JSON NULL,
  status               ENUM('draft','published','hidden') NOT NULL DEFAULT 'draft',
  sort_order           INT NOT NULL DEFAULT 0,
  deleted_at           DATETIME NULL,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE project_photos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id  INT UNSIGNED NOT NULL,
  path        VARCHAR(255) NOT NULL,
  thumb_path  VARCHAR(255) NOT NULL,
  alt         VARCHAR(255) NOT NULL,
  is_cover    TINYINT(1) NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0,
  KEY ix_photos_project (project_id),
  CONSTRAINT fk_photos_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wa_templates (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key`       ENUM('welcome','day1','day3','day7','quote_sent','install_done') NOT NULL,
  lang        CHAR(2) NOT NULL,
  body        TEXT NOT NULL,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wa_key_lang (`key`, lang),
  CONSTRAINT fk_wa_staff FOREIGN KEY (updated_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Installers only ever read this view: won jobs, no money or notes.
CREATE VIEW installer_jobs AS
  SELECT l.id, l.lead_no, l.name, l.phone, d.name_en AS district, d.name_te AS district_te,
         l.area, l.final_kw, l.install_date, l.assigned_to, l.is_test
  FROM leads l
  LEFT JOIN districts d ON d.id = l.district_id
  WHERE l.status = 'won' AND l.deleted_at IS NULL;
