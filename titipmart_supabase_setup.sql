-- =========================================================================
-- TITIPMART ALL-IN-ONE SUPABASE DATABASE SCHEMA & SEED DATA
-- Target DBMS: PostgreSQL (Fully Optimized for Supabase SQL Editor)
-- Created: 2026-05-23
-- Description: This script sets up the full database schemas, constraints,
--              relationships, and inserts pre-seeded demo records for TitipMart.
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 0. CLEANUP (Idempotency - Drops existing tables in reverse dependency order)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS live_notifications CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS promos CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- -------------------------------------------------------------------------
-- 1. TABLE: APP_USERS
-- -------------------------------------------------------------------------
CREATE TABLE app_users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    avatar TEXT,
    role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    wallet_balance NUMERIC(15, 2) DEFAULT 0.00,
    tier VARCHAR(20) DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    last_check_in VARCHAR(50),
    favorites JSONB DEFAULT '[]'::jsonb,
    recently_viewed JSONB DEFAULT '[]'::jsonb,
    kyc_verified BOOLEAN DEFAULT FALSE,
    kyc_doc_url TEXT,
    coins INT DEFAULT 0
);

COMMENT ON TABLE app_users IS 'Tracks shopper, seller, and admin user profiles, loyalty metrics, and wallet balances.';

-- -------------------------------------------------------------------------
-- 2. TABLE: CATEGORIES
-- -------------------------------------------------------------------------
CREATE TABLE categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    bg_gradient TEXT NOT NULL
);

COMMENT ON TABLE categories IS 'Stores active product domains/categories with metadata for icons and custom UI cards.';

-- -------------------------------------------------------------------------
-- 3. TABLE: STORES (Merchant profiles)
-- -------------------------------------------------------------------------
CREATE TABLE stores (
    id VARCHAR(100) PRIMARY KEY,
    owner_id VARCHAR(100) REFERENCES app_users(id) ON DELETE CASCADE,
    store_name VARCHAR(150) NOT NULL,
    description TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    banner TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE stores IS 'KYC-approved seller jastip vendor offices and hubs.';

-- -------------------------------------------------------------------------
-- 4. TABLE: PRODUCTS (3D Catalog)
-- -------------------------------------------------------------------------
CREATE TABLE products (
    id VARCHAR(100) PRIMARY KEY,
    seller_id VARCHAR(100) REFERENCES app_users(id) ON DELETE SET NULL,
    store_name VARCHAR(150),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
    views INT DEFAULT 0,
    sales INT DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    ai_suggested BOOLEAN DEFAULT FALSE,
    three_d_meta JSONB DEFAULT '{"scale": 1, "rotateX": 0, "rotateY": 0, "translateZ": 0, "glowColor": "#FF7A00"}'::jsonb
);

COMMENT ON TABLE products IS 'Jastip 3D Interactive catalog containing stock, prices and physical matrix.';

-- -------------------------------------------------------------------------
-- 5. TABLE: PROMOS
-- -------------------------------------------------------------------------
CREATE TABLE promos (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent NUMERIC(5, 2) NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
    description TEXT,
    active BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE promos IS 'Promotional codes that consumers can claim and redeem for purchase cashback.';

-- -------------------------------------------------------------------------
-- 6. TABLE: ORDERS
-- -------------------------------------------------------------------------
CREATE TABLE orders (
    id VARCHAR(100) PRIMARY KEY,
    buyer_id VARCHAR(100) REFERENCES app_users(id) ON DELETE SET NULL,
    buyer_name VARCHAR(150) NOT NULL,
    shipping_address TEXT NOT NULL,
    courier VARCHAR(100) NOT NULL,
    total_price NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE orders IS 'Primary escrow jastip purchase transactions.';

-- -------------------------------------------------------------------------
-- 7. TABLE: ORDER_ITEMS
-- -------------------------------------------------------------------------
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    image TEXT
);

COMMENT ON TABLE order_items IS 'Line item sub-records for product elements inside an order.';

-- -------------------------------------------------------------------------
-- 8. TABLE: PAYMENTS (Pakasir QRIS Gateway Simulators)
-- -------------------------------------------------------------------------
CREATE TABLE payments (
    id VARCHAR(100) PRIMARY KEY,
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
    invoice_id VARCHAR(150) NOT NULL,
    qris_string TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'EXPIRED')),
    amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE payments IS 'Simulated invoice payments via auto-generated QRIS barcodes.';

-- -------------------------------------------------------------------------
-- 9. TABLE: REVIEWS
-- -------------------------------------------------------------------------
CREATE TABLE reviews (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(100) REFERENCES app_users(id) ON DELETE SET NULL,
    username VARCHAR(100) NOT NULL,
    avatar TEXT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    photo_url TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reviews IS 'Verifiable consumer reviews featuring rating stars, unboxing photo attachments, and video clips.';

-- -------------------------------------------------------------------------
-- 10. TABLE: CHAT_MESSAGES
-- -------------------------------------------------------------------------
CREATE TABLE chat_messages (
    id VARCHAR(100) PRIMARY KEY,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_cs BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE chat_messages IS 'Conversational history record across buyer, admin, and merchant desks.';

-- -------------------------------------------------------------------------
-- 11. TABLE: LIVE_NOTIFICATIONS
-- -------------------------------------------------------------------------
CREATE TABLE live_notifications (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('order', 'review', 'system', 'payment')),
    time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE live_notifications IS 'Dynamic feed notifications shown inside TitipMart Hub.';


-- =========================================================================
--                     II. SEED DATA REVOLUTION (INSERT STATEMENTS)
-- =========================================================================

-- Seed App Users (Buyer, Seller & Admin)
INSERT INTO app_users (id, username, email, avatar, role, wallet_balance, tier, last_check_in, favorites, kyc_verified, coins) VALUES
('cust-1', 'Perdhana Riyan', 'perdhanariyan@gmail.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg', 'buyer', 5000000.00, 'GOLD', 'Sat May 23 2026', '["prod-glasses", "prod-keyboard"]'::jsonb, TRUE, 5400),
('seller-tokyo', 'Takeshi Sato', 'takeshi@tokyojastip.jp', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d.jpg', 'seller', 12500000.00, 'PLATINUM', NULL, '[]'::jsonb, TRUE, 12000),
('seller-seoul', 'Kim Min-seo', 'minseo@seouljastip.kr', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330.jpg', 'seller', 8900000.00, 'GOLD', NULL, '[]'::jsonb, TRUE, 4300),
('co-admin', 'TitipMart Admin Hub', 'admin@titipmart.com', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61.jpg', 'admin', 0.00, 'PLATINUM', NULL, '[]'::jsonb, TRUE, 0);

-- Seed Categories
INSERT INTO categories (id, name, icon, bg_gradient) VALUES
('gadget', 'Gadget & Gear', 'Laptop', 'from-blue-600 to-indigo-700'),
('fashion', 'Mode & Luxury', 'ShoppingBag', 'from-amber-500 to-orange-600'),
('food', 'Snack & Coffee', 'Coffee', 'from-emerald-500 to-teal-600');

-- Seed Merchants / Stores
INSERT INTO stores (id, owner_id, store_name, description, rating, banner) VALUES
('tokyo-bazaar', 'seller-tokyo', 'Tokyo Retro Bazaar', 'Jasa Titip Spesialis Barang Vintage, Action Figure Koleksi, Lensa Kamera & Gadget Terbatas langsung dari Akihabara & Shibuya, Tokyo.', 4.95, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989.jpg'),
('seoul-aesthetic', 'seller-seoul', 'K-Style Aesthetics', 'K-Beauty Skincare, premium sunglasses, designer bags, and streetwear direct shipping from Gangnam, Seoul.', 4.88, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc.jpg');

-- Seed 3D Ready Products
INSERT INTO products (id, seller_id, store_name, title, slug, description, price, stock, images, category_id, views, sales, rating, ai_suggested, three_d_meta) VALUES
(
    'prod-glasses', 
    'seller-seoul', 
    'K-Style Aesthetics', 
    'K-Design Cyber Sunglasses', 
    'k-design-cyber-sunglasses', 
    'Kacamata hitam berdesain futuristik cyberpunk yang sangat populer di kalangan musisi K-Pop di Seoul. Frame titanium ringan tahan banting dengan lensa proteksi UV polarisasi optimal.', 
    1850000.00, 
    15, 
    '["/src/assets/images/exclusive_glasses_promo_1779529622000.png", "/src/assets/images/placeholder_product_images_11110.png"]'::jsonb, 
    'fashion', 
    890, 
    24, 
    4.90, 
    TRUE, 
    '{"scale": 1.25, "rotateX": 15, "rotateY": 45, "translateZ": -10, "glowColor": "#ff7a00"}'::jsonb
),
(
    'prod-keyboard', 
    'seller-tokyo', 
    'Tokyo Retro Bazaar', 
    'Hacker Mech-Keyboard C3', 
    'hacker-mech-keyboard-c3', 
    'Mechanical keyboard premium dengan layout ultra compact 65%, switch tactile kustom berlubrikasi pabrik, casing alumunium utuh CNC anodized, serta pencahayaan neon ambient premium langsung dari Tokyo Tech Lab.', 
    2450000.00, 
    8, 
    '["/src/assets/images/default_store_banner_1779528712410.png"]'::jsonb, 
    'gadget', 
    1450, 
    12, 
    5.00, 
    TRUE, 
    '{"scale": 1.10, "rotateX": 25, "rotateY": -35, "translateZ": -5, "glowColor": "#0085ff"}'::jsonb
),
(
    'prod-beverage', 
    'seller-tokyo', 
    'Tokyo Retro Bazaar', 
    'Matcha Latte Premium Powder', 
    'matcha-latte-premium-powder', 
    'Bubuk minuman Matcha organik super fine kelas upacara teh (Ceremonial Grade) digiling batu tradisional langsung dari perkebunan teh kuno daerah Uji, Kyoto, Jepang. Nikmat, kaya antioksidan.', 
    399000.00, 
    50, 
    '["/src/assets/images/welcome_promo_card_1779529424669.png"]'::jsonb, 
    'food', 
    620, 
    45, 
    4.85, 
    FALSE, 
    '{"scale": 1.00, "rotateX": 0, "rotateY": 90, "translateZ": 0, "glowColor": "#22c55e"}'::jsonb
);

-- Seed System Promos (Active but initially disabled on app start based on demand)
INSERT INTO promos (id, code, discount_percent, description, active) VALUES
('pr-1', 'TITIPNEW', 20.00, 'Diskon 20% khusus jastip member baru!', FALSE),
('pr-2', 'PROMOJASTIP', 10.00, 'Potongan harga Jasa Titip 10% Flat!', FALSE);

-- Seed Escrow Orders
INSERT INTO orders (id, buyer_id, buyer_name, shipping_address, courier, total_price, status, created_at) VALUES
('order-9981', 'cust-1', 'Perdhana Riyan', 'Jl. Sudirman No 120, Menteng, DKI Jakarta, Indonesia', 'JNE Cargo OKE', 1850000.00, 'completed', NOW() - INTERVAL '2 days'),
('order-9982', 'cust-1', 'Perdhana Riyan', 'Jl. Sudirman No 120, Menteng, DKI Jakarta, Indonesia', 'TitipMart Hand Carry Express', 2450000.00, 'processing', NOW() - INTERVAL '1 hour');

-- Seed Order Line Items
INSERT INTO order_items (order_id, product_id, product_title, price, quantity, image) VALUES
('order-9981', 'prod-glasses', 'K-Design Cyber Sunglasses', 1850000.00, 1, '/src/assets/images/exclusive_glasses_promo_1779529622000.png'),
('order-9982', 'prod-keyboard', 'Hacker Mech-Keyboard C3', 2450000.00, 1, '/src/assets/images/default_store_banner_1779528712410.png');

-- Seed QRIS Payment Invoices
INSERT INTO payments (id, order_id, invoice_id, qris_string, status, amount, created_at) VALUES
('pay-101', 'order-9981', 'INV-2026-05-9981', '00020101021226380010ID.CO.QQPAY.WWW01189360012011122131235204400053033605802ID5914TITIPMART_CORP6007JAKARTA61051212062070703A016304CA12', 'PAID', 1850000.00, NOW() - INTERVAL '2 days'),
('pay-102', 'order-9982', 'INV-2026-05-9982', '00020101021226380010ID.CO.QQPAY.WWW01189360012011122131235204400053033605802ID5914TITIPMART_CORP6007JAKARTA61051212062070703A016304CA12', 'UNPAID', 2450000.00, NOW() - INTERVAL '1 hour');

-- Seed Reviews featuring Photos & Video URL
INSERT INTO reviews (id, product_id, user_id, username, avatar, rating, comment, photo_url, video_url, created_at) VALUES
(
    'rev-cyber-01', 
    'prod-glasses', 
    'cust-1', 
    'Rian Hidayat', 
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg', 
    5, 
    'Kualitas barang sangat mewah, persis seperti deskripsi 3D. Jastip dari toko ini sangat responsif dan amanah. Rekomendasi bintang 5!', 
    'https://images.unsplash.com/photo-1542751371-adc38448a05e.jpg', 
    'https://www.w3schools.com/html/mov_bbb.mp4', 
    NOW() - INTERVAL '3 days'
),
(
    'rev-cyber-02', 
    'prod-glasses', 
    'seller-tokyo', -- Used demo buyer avatar
    'Sarah Amalia', 
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330.jpg', 
    5, 
    'Wow, barang sampai mendarat mulus tanpa cacat! Packing pengiriman jastip ekstra aman dapet bubble wrap tebal. Gak nyesel beli di TitipMart.', 
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc.jpg', 
    NULL, 
    NOW() - INTERVAL '1 day'
);

-- Seed Chat Messages
INSERT INTO chat_messages (id, sender_id, sender_name, receiver_id, message, timestamp, is_cs) VALUES
('msg-1', 'cust-1', 'Perdhana Riyan', 'cs', 'Halo CS TitipMart, saya mau bertanya apakah pengiriman dari Tokyo aman dari bea cukai?', NOW() - INTERVAL '10 minutes', FALSE),
('msg-2', 'cs', 'Sistem Robot CS', 'cust-1', 'Tentu saja kak Perdhana Riyan! Kami menggunakan kargo jastip resmi berpajak terpadu sehingga seluruh jaminan pengiriman bebas hambatan bea cukai.', NOW() - INTERVAL '9 minutes', TRUE);

-- Seed Live Notifications
INSERT INTO live_notifications (id, title, message, type, time) VALUES
('notif-1001', 'TitipMart Aktif 🏆', 'Sistem pusat TitipMart berjalan dalam mode produksi handal.', 'system', NOW()),
('notif-1002', 'Dana Escrow Ditransaksikan 🔔', 'Shopper Perdhana Riyan melakukan pembayaran untuk order-9981 sebesar Rp 1.850.000.', 'payment', NOW() - INTERVAL '2 days');
