-- Swasthanand Platform PostgreSQL Schema Initialization

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    phone VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    addresses_json TEXT
);

CREATE TABLE IF NOT EXISTS farm_batches (
    id VARCHAR(255) PRIMARY KEY,
    harvest_date DATE,
    location_coordinates VARCHAR(255),
    region VARCHAR(255),
    soil_test_url VARCHAR(255),
    weather_snapshot VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS dealership_nodes (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geofence_radius_km DOUBLE PRECISION NOT NULL,
    assigned_dealer_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(255) UNIQUE,
    price DECIMAL(19, 2) NOT NULL,
    description TEXT,
    benefits_description TEXT,
    category VARCHAR(255),
    tags_json TEXT,
    batch_id VARCHAR(255) REFERENCES farm_batches(id) ON DELETE SET NULL,
    origin VARCHAR(255),
    image VARCHAR(255),
    stock INTEGER DEFAULT 100,
    is_approved BOOLEAN DEFAULT FALSE,
    harvest_date VARCHAR(255),
    weather_temp VARCHAR(255),
    growth_quality VARCHAR(255),
    organic_matter VARCHAR(255),
    nitrogen VARCHAR(255),
    zero_pesticides VARCHAR(255),
    certificate_url VARCHAR(255),
    status VARCHAR(50),
    dealership_node_id VARCHAR(255) REFERENCES dealership_nodes(id) ON DELETE SET NULL,
    expiry_date DATE
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    total_amount DECIMAL(19, 2),
    status VARCHAR(50) NOT NULL,
    razorpay_order_id VARCHAR(255),
    dealership_node_id VARCHAR(255) REFERENCES dealership_nodes(id) ON DELETE SET NULL,
    items_json TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancellation_reason VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS product_notifications (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    contact_info VARCHAR(255) NOT NULL,
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_dealership_node_id ON products(dealership_node_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_dealership_node_id ON orders(dealership_node_id);
CREATE INDEX IF NOT EXISTS idx_dealership_nodes_assigned_dealer_id ON dealership_nodes(assigned_dealer_id);
CREATE INDEX IF NOT EXISTS idx_product_notifications_product_id_notified ON product_notifications(product_id, notified);

CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(255) PRIMARY KEY,
    sku VARCHAR(255) NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE,
    qc_status VARCHAR(50) NOT NULL,
    current_state VARCHAR(50) NOT NULL,
    dealer_allocation VARCHAR(255),
    warehouse VARCHAR(255),
    inventory INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory_history (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    dealership_node_id VARCHAR(255),
    change_quantity INT NOT NULL,
    resulting_stock INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    performed_by VARCHAR(255),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    performed_by VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batches_sku ON batches(sku);
CREATE INDEX IF NOT EXISTS idx_batches_current_state ON batches(current_state);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);

CREATE TABLE IF NOT EXISTS dealer_alerts (
    id VARCHAR(255) PRIMARY KEY,
    dealer_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'INFORMATION',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dealer_alerts_dealer_id ON dealer_alerts(dealer_id);

CREATE TABLE IF NOT EXISTS dealer_certifications (
    id VARCHAR(255) PRIMARY KEY,
    dealer_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    cert_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    cert_number VARCHAR(255),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    issue_date VARCHAR(50),
    expiry_date VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dealer_certs_dealer_id ON dealer_certifications(dealer_id);

ALTER TABLE products ADD COLUMN IF NOT EXISTS mfg_date VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS processing_details TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_details TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS transport_details TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_info TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dealer_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_products_dealer_id ON products(dealer_id);




