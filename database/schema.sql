CREATE DATABASE auction_db;
USE auction_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    seller_id INT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    starting_price DECIMAL(10, 2) NOT NULL,
    current_highest_bid DECIMAL(10, 2) DEFAULT 0.00,
    auction_end_time DATETIME NOT NULL,
    item_condition VARCHAR(50),
    image_url VARCHAR(255),
    status ENUM('active', 'ended', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE bids (
    bid_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    bidder_id INT,
    bid_amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(user_id) ON DELETE CASCADE
);