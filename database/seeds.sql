-- IMPORT THIS INTO SQL CLIENT
INSERT INTO categories (name) VALUES 
('Anime Figures'), 
('Trading Cards'), 
('Electronics'), 
('Vintage Collectibles');

INSERT INTO users (first_name, last_name, email, password) VALUES 
('AAnime', 'Vault', 'vault@anime.com', 'password123'),
('Pika', 'Pros', 'pika@cards.com', 'password123'),
('TCG', 'Treasures', 'treasures@tcg.com', 'password123');

INSERT INTO items (category_id, seller_id, title, description, starting_price, current_bid, end_time, image_url, status) VALUES 
(
    (SELECT id FROM categories WHERE name = 'Anime Figures'), 
    (SELECT id FROM users WHERE email = 'vault@anime.com'),
    'Limited Edition Naruto (Nine-Tails Chakra Mode)', 
    'A high-quality PVC figure of Naruto in his chakra mode. Pristine condition with original box.', 
    2500.00, 3200.00, 
    DATE_ADD(NOW(), INTERVAL 7 DAY), 
    'https://example.com/images/naruto.jpg', 'active'
),
(
    (SELECT id FROM categories WHERE name = 'Trading Cards'), 
    (SELECT id FROM users WHERE email = 'pika@cards.com'),
    'PSA 10 Gem Mint Shadowless First Edition Charizard', 
    'The holy grail of Pokémon cards. Authenticated and graded by PSA as Gem Mint 10.', 
    100000.00, 125000.00, 
    DATE_ADD(NOW(), INTERVAL 3 DAY), 
    'https://example.com/images/charizard.jpg', 'active'
),
(
    (SELECT id FROM categories WHERE name = 'Trading Cards'), 
    (SELECT id FROM users WHERE email = 'treasures@tcg.com'),
    'Original Japanese Neo Destiny Sealed Booster Box', 
    'Extremely rare sealed box from the 2001 Japanese set. A true collectors piece.', 
    8500.00, 9800.00, 
    DATE_ADD(NOW(), INTERVAL 5 DAY), 
    'https://example.com/images/tcg_box.jpg', 'active'
);