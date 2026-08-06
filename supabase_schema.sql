-- ==========================================================
-- SMARTFLOW POSTGRESQL SUPABASE SCHEMA INITIALIZATION SCRIPT
-- ==========================================================

CREATE TABLE users (
	id SERIAL NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	password_hash VARCHAR(255), 
	name VARCHAR(255), 
	phone VARCHAR(50), 
	role VARCHAR(50) NOT NULL, 
	address TEXT, 
	google_id VARCHAR(255), 
	provider VARCHAR(50) NOT NULL, 
	profile_picture VARCHAR(500), 
	reset_token VARCHAR(255), 
	reset_token_expiry TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (google_id)
);

CREATE TABLE categories (
	id SERIAL NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	description TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE suppliers (
	id SERIAL NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	contact_name VARCHAR(255), 
	email VARCHAR(255), 
	phone VARCHAR(50), 
	address TEXT, 
	history TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE products (
	id SERIAL NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	sku VARCHAR(100) NOT NULL, 
	category VARCHAR(100), 
	price NUMERIC(10, 2) NOT NULL, 
	cost_price NUMERIC(10, 2), 
	quantity INTEGER NOT NULL, 
	status VARCHAR(50), 
	image VARCHAR(255), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	barcode VARCHAR(100), 
	expiry_date TIMESTAMP WITHOUT TIME ZONE, 
	supplier_id INTEGER, 
	PRIMARY KEY (id), 
	UNIQUE (barcode), 
	FOREIGN KEY(supplier_id) REFERENCES suppliers (id)
);

CREATE TABLE inventory (
	id SERIAL NOT NULL, 
	product_id INTEGER NOT NULL, 
	quantity INTEGER NOT NULL, 
	location VARCHAR(100), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);

CREATE TABLE stock_history (
	id SERIAL NOT NULL, 
	product_id INTEGER NOT NULL, 
	change_amount INTEGER NOT NULL, 
	reason VARCHAR(255) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);

CREATE TABLE sales (
	id VARCHAR(50) NOT NULL, 
	customer VARCHAR(255), 
	date TIMESTAMP WITHOUT TIME ZONE, 
	total NUMERIC(10, 2) NOT NULL, 
	status VARCHAR(50), 
	payment_method VARCHAR(50), 
	email VARCHAR(255), 
	subtotal NUMERIC(10, 2), 
	tax NUMERIC(10, 2), 
	discount NUMERIC(10, 2), 
	phone VARCHAR(50), 
	address TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE sale_items (
	id SERIAL NOT NULL, 
	sale_id VARCHAR(50) NOT NULL, 
	product_id INTEGER NOT NULL, 
	quantity INTEGER NOT NULL, 
	price NUMERIC(10, 2) NOT NULL, 
	amount NUMERIC(10, 2) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(sale_id) REFERENCES sales (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);

CREATE TABLE settings (
	id INTEGER NOT NULL, 
	org_name VARCHAR(255), 
	email VARCHAR(255), 
	currency VARCHAR(10), 
	timezone VARCHAR(50), 
	tax_rate NUMERIC(5, 2), 
	invoice_prefix VARCHAR(20), 
	payment_terms VARCHAR(50), 
	barcode_scanner BOOLEAN, 
	auto_print_receipt BOOLEAN, 
	low_stock_threshold INTEGER, 
	email_alerts BOOLEAN, 
	ai_alerts BOOLEAN, 
	auto_backup BOOLEAN, 
	backup_interval VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE notifications (
	id SERIAL NOT NULL, 
	type VARCHAR(50), 
	title VARCHAR(255) NOT NULL, 
	message TEXT NOT NULL, 
	read BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE orders (
	id SERIAL NOT NULL, 
	supplier_id INTEGER NOT NULL, 
	order_date TIMESTAMP WITHOUT TIME ZONE, 
	status VARCHAR(50), 
	total_amount NUMERIC(10, 2) NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(supplier_id) REFERENCES suppliers (id)
);

CREATE TABLE order_items (
	id SERIAL NOT NULL, 
	order_id INTEGER NOT NULL, 
	product_id INTEGER NOT NULL, 
	quantity INTEGER NOT NULL, 
	price NUMERIC(10, 2) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(order_id) REFERENCES orders (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);
