-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS collectors_db;
USE collectors_db;

-- 2. Hobbies Table (For the datalist/dropdown)
CREATE TABLE IF NOT EXISTS hobbies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hobby_name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact_number VARCHAR(20),
    hobbies VARCHAR(100), -- Stores the hobby name selected by the user
    gender ENUM('Male', 'Female', 'Other'),
    password VARCHAR(255) NOT NULL, -- Long length to accommodate bcrypt hashes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Initial Hobby Data
INSERT IGNORE INTO hobbies (hobby_name) VALUES 
('Anime Figures'),
('Trading Cards'),
('Vintage Coins'),
('Rare Sneakers'),
('Comic Books'),
('Retro Video Games'),
('Vinyl Records'),
('Antique Watches');