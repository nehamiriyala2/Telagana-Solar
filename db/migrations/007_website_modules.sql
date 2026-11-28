-- Website modules (Districts, Schemes, Projects, Content). Additive only: no column or row is dropped.
-- Every public text has an English and a Telugu column.

-- A. Districts: the rest of the district page.
ALTER TABLE districts
  ADD COLUMN about_en        TEXT NULL AFTER summary_te,
  ADD COLUMN about_te        TEXT NULL AFTER about_en,
  ADD COLUMN solar_types_en  TEXT NULL AFTER about_te,        -- one per line, e.g. "Rooftop on-grid for homes"
  ADD COLUMN solar_types_te  TEXT NULL AFTER solar_types_en,
  ADD COLUMN local_notes_en  TEXT NULL AFTER solar_types_te,
  ADD COLUMN local_notes_te  TEXT NULL AFTER local_notes_en,
  ADD COLUMN seo_title_en    VARCHAR(160) NULL AFTER local_notes_te,
  ADD COLUMN seo_title_te    VARCHAR(200) NULL AFTER seo_title_en,
  ADD COLUMN seo_desc_en     VARCHAR(320) NULL AFTER seo_title_te,
  ADD COLUMN seo_desc_te     VARCHAR(400) NULL AFTER seo_desc_en;

-- C. Schemes: one record = one public page. `status` (draft/published/needs_review) stays the publish state;
--    scheme_status is whether the scheme itself is running.
ALTER TABLE schemes
  ADD COLUMN authority_en   VARCHAR(200) NULL AFTER name_te,
  ADD COLUMN authority_te   VARCHAR(240) NULL AFTER authority_en,
  ADD COLUMN benefit_en     TEXT NULL AFTER eligibility_te,
  ADD COLUMN benefit_te     TEXT NULL AFTER benefit_en,
  ADD COLUMN source_url     VARCHAR(255) NULL AFTER official_url,
  ADD COLUMN all_districts  TINYINT(1) NOT NULL DEFAULT 1 AFTER source_url,
  ADD COLUMN scheme_status  ENUM('active','paused','closed') NOT NULL DEFAULT 'active' AFTER all_districts,
  ADD COLUMN sort_order     INT NOT NULL DEFAULT 0 AFTER scheme_status,
  ADD COLUMN created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER sort_order;
UPDATE schemes SET benefit_en = benefit_text WHERE benefit_en IS NULL AND benefit_text IS NOT NULL;

-- D. Projects: completed installations.
ALTER TABLE projects
  ADD COLUMN title_te       VARCHAR(200) NULL AFTER title,
  ADD COLUMN slug           VARCHAR(80) NULL AFTER title_te,
  ADD COLUMN install_date   DATE NULL AFTER kw,
  ADD COLUMN savings_month  INT UNSIGNED NULL AFTER monthly_units,
  ADD COLUMN customer_name  VARCHAR(60) NULL AFTER story_te,        -- first name only (privacy)
  ADD COLUMN quote_en       TEXT NULL AFTER customer_name,
  ADD COLUMN quote_te       TEXT NULL AFTER quote_en,
  ADD COLUMN featured       TINYINT(1) NOT NULL DEFAULT 0 AFTER quote_te,
  ADD COLUMN created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER featured,
  ADD UNIQUE KEY uq_projects_slug (slug);

-- F. Content: guides / blog posts.
CREATE TABLE posts (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug           VARCHAR(100) NOT NULL,
  kind           ENUM('guide','news') NOT NULL DEFAULT 'guide',
  title_en       VARCHAR(200) NOT NULL,
  title_te       VARCHAR(260) NULL,
  excerpt_en     VARCHAR(400) NULL,
  excerpt_te     VARCHAR(600) NULL,
  body_en        MEDIUMTEXT NULL,          -- simple Markdown (headings, lists, bold, links)
  body_te        MEDIUMTEXT NULL,
  cover_image    VARCHAR(255) NULL,
  cover_alt      VARCHAR(200) NULL,
  seo_title_en   VARCHAR(160) NULL,
  seo_title_te   VARCHAR(200) NULL,
  seo_desc_en    VARCHAR(320) NULL,
  seo_desc_te    VARCHAR(400) NULL,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at   DATETIME NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  deleted_at     DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_posts_slug (slug),
  KEY ix_posts_status (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials: property type and where they are from.
ALTER TABLE testimonials
  ADD COLUMN type        ENUM('home','farm','business') NOT NULL DEFAULT 'home' AFTER name,
  ADD COLUMN place       VARCHAR(120) NULL AFTER district_id,
  ADD COLUMN created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER sort_order;

-- FAQs: created date for the list.
ALTER TABLE faqs ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER sort_order;
