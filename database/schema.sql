<<<<<<< HEAD
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
=======
-- IMPORT THIS INTO YOUR SQL CLIENT
CREATE DATABASE IF NOT EXISTS online_auction_system;
USE online_auction_system;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    seller_id INT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    starting_price DECIMAL(10, 2) NOT NULL,
    current_bid DECIMAL(10, 2) DEFAULT 0.00,
    end_time DATETIME NOT NULL,
    item_condition VARCHAR(50),
    image_url VARCHAR(255),
    status ENUM('active', 'ended') DEFAULT 'active',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    bidder_id INT,
    bid_amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);
>>>>>>> 17f59e1c0cf4568556e4a5349ef34c299d761a26
