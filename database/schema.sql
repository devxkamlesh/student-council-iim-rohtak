-- ============================================================
--  Student Council, IIM Rohtak — Database Schema
--  Creates every table the application needs.
--  Run once on a fresh MySQL database (e.g. via phpMyAdmin → SQL).
--
--  Note: the first admin user must be created from the app (its
--  password is bcrypt-hashed in code, not in SQL). RBAC permissions
--  and the standard roles are seeded at the bottom of this file.
-- ============================================================

-- ---------- Content: Team ----------
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  linkedin_url VARCHAR(500),
  image_url VARCHAR(500),
  council_batch VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Council batches (current + archived) used to group team members.
CREATE TABLE IF NOT EXISTS council_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Content: Committees ----------
CREATE TABLE IF NOT EXISTS committees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email VARCHAR(255),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  facebook_url VARCHAR(500),
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- Content: Clubs ----------
CREATE TABLE IF NOT EXISTS clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  club_type ENUM('domain', 'recreational') NOT NULL DEFAULT 'domain',
  description TEXT,
  email VARCHAR(255),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  facebook_url VARCHAR(500),
  image_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- Content: Events (with photo gallery) ----------
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_type ENUM('flagship', 'regular') NOT NULL DEFAULT 'flagship',
  description TEXT,
  event_date DATE,
  image_url VARCHAR(500),
  gallery JSON,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- Content: Leave & Timings ----------
CREATE TABLE IF NOT EXISTS shuttle_timings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_of_week VARCHAR(20) NOT NULL,
  from_campus_time TIME NOT NULL,
  from_rajiv_chowk_time TIME NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS other_timings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  time_value VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Gallery (Cloudinary-backed) ----------
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  public_id VARCHAR(255) NOT NULL,
  secure_url VARCHAR(1000) NOT NULL,
  width INT,
  height INT,
  format VARCHAR(20),
  bytes INT,
  caption VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Navigation menu (supports sub-pages via parent_id) ----------
CREATE TABLE IF NOT EXISTS nav_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  href VARCHAR(255) NOT NULL,
  parent_id INT NULL,
  display_order INT DEFAULT 0,
  is_external BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (parent_id) REFERENCES nav_links(id) ON DELETE CASCADE
);

-- ---------- Site settings (logo, banner, footer logo) ----------
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(1000),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- Student forms: grievances ----------
CREATE TABLE IF NOT EXISTS grievances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  batch VARCHAR(50),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- Class timetable ----------
CREATE TABLE IF NOT EXISTS timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch VARCHAR(50) NOT NULL,
  term VARCHAR(50) NOT NULL,
  class_date DATE NOT NULL,
  section CHAR(1) NOT NULL,
  slot_1 VARCHAR(100),
  slot_2 VARCHAR(100),
  slot_3 VARCHAR(100),
  slot_4 VARCHAR(100),
  slot_5 VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  Authentication & Role-Based Access Control
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  perm_key VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  failed_attempts INT DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  ip VARCHAR(45),
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_time (email, created_at),
  INDEX idx_ip_time (ip, created_at)
);

-- ============================================================
--  Reference data: permissions + standard roles
--  (Required for the admin panel & RBAC to function.)
-- ============================================================
INSERT INTO permissions (perm_key, label, category) VALUES
  ('admin.access',        'Access admin panel',                       'General'),
  ('users.view',          'View users',                               'Users'),
  ('users.manage',        'Create / edit / delete users',             'Users'),
  ('roles.view',          'View roles',                               'Roles'),
  ('roles.manage',        'Create / edit / delete roles',             'Roles'),
  ('content.team',        'Manage team members',                      'Content'),
  ('content.committees',  'Manage committees',                        'Content'),
  ('content.clubs',       'Manage clubs',                             'Content'),
  ('content.events',      'Manage events',                            'Content'),
  ('content.gallery',     'Manage gallery',                           'Content'),
  ('content.leave',       'Manage leave & timings',                   'Content'),
  ('content.navigation',  'Manage navigation menu',                   'Content'),
  ('content.settings',    'Manage site settings (logo, banner, footer)', 'Content'),
  ('content.calendar',    'Manage calendar page settings',            'Content'),
  ('calendar.access',     'Access calendar page',                     'Special Access')
ON DUPLICATE KEY UPDATE label = VALUES(label), category = VALUES(category);

-- Administrator (full access) + standard bundled roles.
INSERT INTO roles (name, slug, description, is_system) VALUES
  ('Administrator', 'administrator', 'Full access — every section of the admin panel.', TRUE),
  ('Content Manager', 'content-manager', 'Manage all site content: team, committees, clubs, events, gallery, leave & timings.', FALSE),
  ('Site Manager', 'site-manager', 'Manage navigation menu and site settings (logo, banner, footer).', FALSE),
  ('User Manager', 'user-manager', 'Manage admin user accounts and their role assignments.', FALSE),
  ('Special Access (Calendar)', 'special-access-calendar', 'Access to the restricted Calendar page only.', FALSE),
  ('Member', 'member', 'Default role for new sign-ins. No admin access until a role is assigned.', FALSE)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- Administrator gets every permission.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.slug = 'administrator';

-- Content Manager.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.perm_key IN ('admin.access','content.team','content.committees','content.clubs',
                    'content.events','content.gallery','content.leave')
WHERE r.slug = 'content-manager';

-- Site Manager.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.perm_key IN ('admin.access','content.navigation','content.settings')
WHERE r.slug = 'site-manager';

-- User Manager.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.perm_key IN ('admin.access','users.view','users.manage')
WHERE r.slug = 'user-manager';

-- Special Access (Calendar).
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.perm_key IN ('calendar.access')
WHERE r.slug = 'special-access-calendar';
