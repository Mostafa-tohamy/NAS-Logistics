-- Sample Users
INSERT INTO users (email, password, name, role) VALUES
  ('admin@naslogistics.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Admin User', 'admin'),
  ('manager@naslogistics.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Marketing Manager', 'manager')
ON CONFLICT (email) DO NOTHING;

-- Sample Customers
INSERT INTO customers (first_name, last_name, email, phone, company_name, segment, preferences) VALUES
  ('Ahmed', 'Hassan', 'ahmed@example.com', '+201001234567', 'Tech Corp', 'premium', '{"email": true, "sms": true, "push": true}'),
  ('Fatima', 'Ali', 'fatima@example.com', '+201112345678', 'Retail Store', 'standard', '{"email": true, "sms": false, "push": false}'),
  ('Mohammed', 'Ibrahim', 'mohammed@example.com', '+201223456789', 'E-commerce', 'premium', '{"email": true, "sms": true, "push": false}'),
  ('Layla', 'Omar', 'layla@example.com', '+201334567890', 'Logistics Co', 'enterprise', '{"email": true, "sms": true, "push": true}'),
  ('Karim', 'Mahmoud', 'karim@example.com', '+201445678901', 'Manufacturing', 'standard', '{"email": false, "sms": true, "push": false}')
ON CONFLICT (email) DO NOTHING;

-- Sample Campaigns
INSERT INTO campaigns (name, description, channels, segment, content, status) VALUES
  (
    'Summer Shipping Promotion',
    'Special promotional campaign for summer shipping',
    '["email", "sms"]',
    'standard',
    '{"subject": "Summer Shipping Sale!", "email_body": "<h1>Enjoy 20% off shipping</h1><p>Use code SUMMER20</p>", "sms_body": "Summer Sale! Get 20% off shipping. Code: SUMMER20"}',
    'draft'
  ),
  (
    'Premium Service Launch',
    'Announcement of new premium logistics service',
    '["email", "push"]',
    'premium',
    '{"subject": "New Premium Service", "email_body": "<h1>Premium Service Available</h1>", "push_body": "Check out our new premium service"}',
    'draft'
  )
ON CONFLICT DO NOTHING;
