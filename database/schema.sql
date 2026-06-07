-- ============================================
-- Student Council IIM Rohtak - Database Schema
-- Tables only. No seed/mock data.
-- ============================================

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500),
  image_url VARCHAR(500),
  council_batch VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Committees Table
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

-- Clubs Table
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

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_type ENUM('flagship', 'regular') NOT NULL DEFAULT 'regular',
  description TEXT,
  event_date DATE,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shuttle Timings Table
CREATE TABLE IF NOT EXISTS shuttle_timings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_of_week ENUM('tuesday', 'thursday', 'saturday', 'sunday') NOT NULL,
  from_campus_time TIME NOT NULL,
  from_rajiv_chowk_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grievances Table (for student form submissions)
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

-- Timetable Table
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
