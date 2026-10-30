-- Alvi Studio database. Run once against an empty MySQL database (the one in DATABASE_URL).
-- All table and column names are lowercase snake_case on purpose: on Hostinger's Linux MySQL, mixed-case
-- names get lowercased and break queries (Pulse Pharma needed a fix-table-names.sql for this).
-- Needs MySQL 8 or MariaDB 10.5+. Every table uses utf8mb4.

-- -------------------------------------------------------------- admin login
-- People who can sign in to /admin. Passwords are stored only as scrypt hashes (never plain text).
-- Create the first user with `npm run create-admin` (the password is typed in the terminal, never in a file).
CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL DEFAULT NULL,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;

-- One row per sign-in attempt, so the owner can see failed logins. No passwords are stored here.
CREATE TABLE IF NOT EXISTS admin_login_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT UNSIGNED NULL,
  email VARCHAR(190) NOT NULL DEFAULT '',
  success TINYINT(1) NOT NULL,
  ip VARCHAR(45) NOT NULL DEFAULT '',
  user_agent VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_log_user (admin_user_id, created_at),
  INDEX idx_login_log_created (created_at)
) CHARACTER SET utf8mb4;

-- ---------------------------------------------------------------- enquiries
-- One row per enquiry from /contact. `status` is the working state; every change is also written to
-- enquiry_events so the owner can see who moved it and when. `type` is architecture|interior|civil|consultation.
CREATE TABLE IF NOT EXISTS enquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ref VARCHAR(24) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(190) NOT NULL DEFAULT '',
  message TEXT NULL,
  details JSON NULL,
  status ENUM('new','seen','contacted','quoted','closed') NOT NULL DEFAULT 'new',
  notes TEXT NULL,
  status_changed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enquiries_status_created (status, created_at),
  INDEX idx_enquiries_type (type)
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS enquiry_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  enquiry_id INT UNSIGNED NOT NULL,
  from_status VARCHAR(12) NULL,
  to_status VARCHAR(12) NOT NULL,
  note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_enquiry_events_enquiry (enquiry_id, created_at),
  CONSTRAINT fk_enquiry_events_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries (id) ON DELETE CASCADE
) CHARACTER SET utf8mb4;

-- ------------------------------------------------------------- media library
-- Every uploaded image. `slot` says where it is used ('gallery' now; later e.g. 'home-hero', 'about-fatma').
-- `category` is the gallery category id (elevation, hall, bedroom, kitchen, ...; NULL for non-gallery slots).
-- `alt_text` is shown to search engines and screen readers. is_sample marks stand-in images, never real projects.
CREATE TABLE IF NOT EXISTS media_assets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slot VARCHAR(40) NOT NULL DEFAULT 'gallery',
  title VARCHAR(150) NOT NULL,
  alt_text VARCHAR(250) NOT NULL DEFAULT '',
  category VARCHAR(30) NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(190) NOT NULL DEFAULT '',
  mime_type VARCHAR(40) NOT NULL DEFAULT '',
  size_bytes INT UNSIGNED NOT NULL DEFAULT 0,
  width SMALLINT UNSIGNED NULL,
  height SMALLINT UNSIGNED NULL,
  is_sample TINYINT(1) NOT NULL DEFAULT 0,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_media_slot (slot, is_visible, sort_order),
  INDEX idx_media_category (category)
) CHARACTER SET utf8mb4;

-- ------------------------------------------------------------- page images
-- The hero or banner image for each page, chosen from the media library. path is a site path such as
-- '/about'. No row means the page's built-in design is used. Also the still image shown when 3D cannot load.
CREATE TABLE IF NOT EXISTS page_heroes (
  page_path VARCHAR(120) NOT NULL PRIMARY KEY,
  media_id INT UNSIGNED NULL,
  alt_text VARCHAR(250) NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_page_heroes_media FOREIGN KEY (media_id) REFERENCES media_assets (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4;

-- ---------------------------------------------------------------------- SEO
-- Target search phrases, per page. Used as a checklist in the admin and as the page's keywords meta.
CREATE TABLE IF NOT EXISTS seo_keywords (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keyword VARCHAR(150) NOT NULL,
  page_path VARCHAR(120) NOT NULL DEFAULT '/',
  intent ENUM('primary','secondary','long_tail','brand') NOT NULL DEFAULT 'secondary',
  priority TINYINT UNSIGNED NOT NULL DEFAULT 2,
  target_city VARCHAR(60) NOT NULL DEFAULT 'Himatnagar',
  notes VARCHAR(300) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_seo_keyword_page (keyword, page_path),
  INDEX idx_seo_page (page_path, is_active, priority)
) CHARACTER SET utf8mb4;

-- Owner overrides for a page's title and description. No row means the page's built-in text is used.
CREATE TABLE IF NOT EXISTS page_seo (
  path VARCHAR(120) NOT NULL PRIMARY KEY,
  meta_title VARCHAR(120) NULL,
  meta_description VARCHAR(300) NULL,
  og_image_url VARCHAR(500) NULL,
  noindex TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;

-- ------------------------------------------------------------------ content
-- Real client words, entered by the owner. Nothing is shown until is_visible = 1 and at least 3 are visible.
CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  project_type VARCHAR(30) NOT NULL,
  quote TEXT NOT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_testimonials_visible (is_visible, sort_order)
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(150) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  excerpt VARCHAR(500) NOT NULL DEFAULT '',
  body MEDIUMTEXT NOT NULL,
  cover_url VARCHAR(500) NULL,
  cover_alt VARCHAR(250) NULL,
  meta_description VARCHAR(300) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_posts_published (is_published, published_at)
) CHARACTER SET utf8mb4;

-- Fatma and Aqib (and later staff) for the About page. Written by the owners, never invented.
CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL DEFAULT '',
  bio TEXT NULL,
  photo_media_id INT UNSIGNED NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_team_visible (is_visible, sort_order),
  CONSTRAINT fk_team_photo FOREIGN KEY (photo_media_id) REFERENCES media_assets (id) ON DELETE SET NULL
) CHARACTER SET utf8mb4;

-- Questions and answers shown on a page (and as FAQ data for search engines). page_path '/' = Home.
CREATE TABLE IF NOT EXISTS faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page_path VARCHAR(120) NOT NULL DEFAULT '/',
  question VARCHAR(250) NOT NULL,
  answer TEXT NOT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_faqs_page (page_path, is_visible, sort_order)
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(60) NOT NULL PRIMARY KEY,
  `value` TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;
