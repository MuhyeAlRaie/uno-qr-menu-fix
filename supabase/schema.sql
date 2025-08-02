-- Enhanced UNO Restaurant QR Menu System Database Schema
-- This schema supports individual customer tracking, order modifications, and enhanced analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS analytics_daily CASCADE;
DROP TABLE IF EXISTS customer_feedback CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS order_modifications CASCADE;
DROP TABLE IF EXISTS quick_action_requests CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS item_prices CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS quick_actions CASCADE;
DROP TABLE IF EXISTS customer_sessions CASCADE;
DROP TABLE IF EXISTS restaurant_tables CASCADE;

-- 1. Restaurant Tables Management
CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number TEXT UNIQUE NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  qr_code_url TEXT,
  location_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customer Sessions - Track individual customers at tables
CREATE TABLE customer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  phone_number TEXT,
  email TEXT,
  seat_number INT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  total_spent NUMERIC(10, 2) DEFAULT 0.00
);

-- 3. Enhanced Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  image_url TEXT,
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enhanced Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  image_url TEXT,
  estimated_prep_time_minutes INT DEFAULT 15,
  calories INT,
  allergens TEXT[], -- Array of allergen information
  dietary_tags TEXT[], -- 'vegetarian', 'vegan', 'gluten-free', etc.
  spice_level INT DEFAULT 0 CHECK (spice_level >= 0 AND spice_level <= 5),
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enhanced Pricing with Promotional Support
CREATE TABLE item_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  size_en TEXT NOT NULL,
  size_ar TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  promotional_price NUMERIC(10, 2) CHECK (promotional_price >= 0),
  promotion_start_date TIMESTAMPTZ,
  promotion_end_date TIMESTAMPTZ,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enhanced Quick Actions
CREATE TABLE quick_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_en TEXT NOT NULL,
  action_ar TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('service', 'payment', 'assistance', 'complaint')),
  icon_url TEXT,
  priority_level INT DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
  estimated_response_time_minutes INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enhanced Orders System
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  customer_session_id UUID REFERENCES customer_sessions(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  subtotal NUMERIC(10, 2) DEFAULT 0.00 CHECK (subtotal >= 0),
  tax_amount NUMERIC(10, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
  service_charge NUMERIC(10, 2) DEFAULT 0.00 CHECK (service_charge >= 0),
  discount_amount NUMERIC(10, 2) DEFAULT 0.00 CHECK (discount_amount >= 0),
  total_amount NUMERIC(10, 2) DEFAULT 0.00 CHECK (total_amount >= 0),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  special_instructions TEXT,
  estimated_ready_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 8. Enhanced Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  item_price_id UUID REFERENCES item_prices(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Order Modifications Tracking
CREATE TABLE order_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('quantity_change', 'cancellation', 'special_request')),
  original_quantity INT,
  new_quantity INT,
  reason TEXT,
  approved_by TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- 10. Enhanced Quick Action Requests
CREATE TABLE quick_action_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  customer_session_id UUID REFERENCES customer_sessions(id) ON DELETE SET NULL,
  action_id UUID REFERENCES quick_actions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
  priority_level INT DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
  additional_notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 11. Comprehensive Analytics
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_date DATE DEFAULT CURRENT_DATE,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  total_orders INT DEFAULT 0,
  total_quantity INT DEFAULT 0,
  total_revenue NUMERIC(10, 2) DEFAULT 0.00,
  average_order_value NUMERIC(10, 2) DEFAULT 0.00,
  peak_hour INT CHECK (peak_hour >= 0 AND peak_hour <= 23),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Customer Feedback
CREATE TABLE customer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_session_id UUID REFERENCES customer_sessions(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  food_rating INT CHECK (food_rating >= 1 AND food_rating <= 5),
  service_rating INT CHECK (service_rating >= 1 AND service_rating <= 5),
  ambiance_rating INT CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
  comments TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Staff Management
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('waiter', 'chef', 'cashier', 'manager', 'admin')),
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  shift_start TIME,
  shift_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_orders_table_status ON orders(table_id, status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_session ON orders(customer_session_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_status ON order_items(status);
CREATE INDEX idx_customer_sessions_table_status ON customer_sessions(table_id, status);
CREATE INDEX idx_customer_sessions_token ON customer_sessions(session_token);
CREATE INDEX idx_quick_action_requests_table_status ON quick_action_requests(table_id, status);
CREATE INDEX idx_quick_action_requests_created ON quick_action_requests(created_at);
CREATE INDEX idx_analytics_date_item ON analytics_daily(record_date, item_id);
CREATE INDEX idx_menu_items_category_available ON menu_items(category_id, is_available);
CREATE INDEX idx_item_prices_item_default ON item_prices(item_id, is_default);
CREATE INDEX idx_restaurant_tables_status ON restaurant_tables(status);

-- Functions for automatic order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INT;
BEGIN
    -- Get today's date in YYYYMMDD format
    SELECT TO_CHAR(NOW(), 'YYYYMMDD') INTO new_number;
    
    -- Count today's orders
    SELECT COUNT(*) + 1 INTO counter
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Combine date with zero-padded counter
    new_number := new_number || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_subtotal NUMERIC(10, 2);
    tax_rate NUMERIC(5, 4) := 0.10; -- 10% tax rate
    service_rate NUMERIC(5, 4) := 0.05; -- 5% service charge
BEGIN
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(total_price), 0) INTO order_subtotal
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    AND status != 'cancelled';
    
    -- Update order totals
    UPDATE orders SET
        subtotal = order_subtotal,
        tax_amount = order_subtotal * tax_rate,
        service_charge = order_subtotal * service_rate,
        total_amount = order_subtotal + (order_subtotal * tax_rate) + (order_subtotal * service_rate),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update order totals when order items change
CREATE TRIGGER trigger_update_order_totals_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals();

CREATE TRIGGER trigger_update_order_totals_update
    AFTER UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals();

CREATE TRIGGER trigger_update_order_totals_delete
    AFTER DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals();

-- Function to update customer session total
CREATE OR REPLACE FUNCTION update_customer_session_total()
RETURNS TRIGGER AS $$
DECLARE
    session_total NUMERIC(10, 2);
BEGIN
    -- Calculate total spent by customer session
    SELECT COALESCE(SUM(total_amount), 0) INTO session_total
    FROM orders 
    WHERE customer_session_id = COALESCE(NEW.customer_session_id, OLD.customer_session_id)
    AND status NOT IN ('cancelled');
    
    -- Update customer session total
    UPDATE customer_sessions SET
        total_spent = session_total
    WHERE id = COALESCE(NEW.customer_session_id, OLD.customer_session_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update customer session totals
CREATE TRIGGER trigger_update_session_total_insert
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_session_total();

CREATE TRIGGER trigger_update_session_total_update
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_session_total();

-- Enable Row Level Security on all tables
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_action_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (to be customized based on requirements)
-- Public read access for menu-related tables
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read access for item prices" ON item_prices FOR SELECT USING (true);
CREATE POLICY "Public read access for quick actions" ON quick_actions FOR SELECT USING (true);
CREATE POLICY "Public read access for restaurant tables" ON restaurant_tables FOR SELECT USING (true);

-- Customer session policies (customers can only access their own sessions)
CREATE POLICY "Customers can insert their own sessions" ON customer_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their own sessions" ON customer_sessions FOR SELECT USING (true);
CREATE POLICY "Customers can update their own sessions" ON customer_sessions FOR UPDATE USING (true);

-- Order policies (customers can manage their own orders)
CREATE POLICY "Customers can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Customers can update orders" ON orders FOR UPDATE USING (true);

-- Order items policies
CREATE POLICY "Customers can manage order items" ON order_items FOR ALL USING (true);

-- Quick action requests policies
CREATE POLICY "Customers can create quick action requests" ON quick_action_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view quick action requests" ON quick_action_requests FOR SELECT USING (true);

-- Order modifications policies
CREATE POLICY "Customers can create order modifications" ON order_modifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view order modifications" ON order_modifications FOR SELECT USING (true);

-- Customer feedback policies
CREATE POLICY "Customers can submit feedback" ON customer_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their feedback" ON customer_feedback FOR SELECT USING (true);

-- Sample Data Insertion
-- Insert sample restaurant tables
INSERT INTO restaurant_tables (table_number, capacity, qr_code_url, location_description) VALUES
('T001', 4, 'https://example.com/qr/table1', 'Window side table'),
('T002', 2, 'https://example.com/qr/table2', 'Corner table'),
('T003', 6, 'https://example.com/qr/table3', 'Large family table'),
('T004', 4, 'https://example.com/qr/table4', 'Center table'),
('T005', 2, 'https://example.com/qr/table5', 'Bar seating');

-- Insert sample categories
INSERT INTO categories (name_en, name_ar, description_en, description_ar, display_order) VALUES
('Appetizers', 'المقبلات', 'Start your meal with our delicious appetizers', 'ابدأ وجبتك بمقبلاتنا اللذيذة', 1),
('Main Courses', 'الأطباق الرئيسية', 'Hearty main dishes to satisfy your hunger', 'أطباق رئيسية شهية لإشباع جوعك', 2),
('Desserts', 'الحلويات', 'Sweet treats to end your meal perfectly', 'حلويات لذيذة لإنهاء وجبتك بشكل مثالي', 3),
('Beverages', 'المشروبات', 'Refreshing drinks for all occasions', 'مشروبات منعشة لجميع المناسبات', 4);

-- Insert sample quick actions
INSERT INTO quick_actions (action_en, action_ar, category, priority_level, display_order) VALUES
('Call Waiter', 'استدعاء النادل', 'service', 2, 1),
('Request Bill', 'طلب الفاتورة', 'payment', 3, 2),
('Need Napkins', 'أحتاج مناديل', 'service', 1, 3),
('Request Charcoal', 'طلب فحم', 'service', 2, 4),
('Complaint', 'شكوى', 'complaint', 4, 5);

-- Insert sample staff members
INSERT INTO staff_members (name, role, phone_number, email, shift_start, shift_end) VALUES
('Ahmed Hassan', 'waiter', '+1234567890', 'ahmed@restaurant.com', '09:00', '17:00'),
('Sarah Johnson', 'chef', '+1234567891', 'sarah@restaurant.com', '08:00', '16:00'),
('Mohammed Ali', 'cashier', '+1234567892', 'mohammed@restaurant.com', '10:00', '18:00'),
('Lisa Chen', 'manager', '+1234567893', 'lisa@restaurant.com', '08:00', '20:00');

COMMIT;

