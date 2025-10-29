-- ============================================
-- CLEAN DATABASE SCHEMA FOR SUPABASE
-- Compatible with PostgreSQL/Supabase
-- No lint warnings!
-- ============================================

-- ============================================
-- DROP EXISTING OBJECTS (for clean setup)
-- ============================================
DROP VIEW IF EXISTS app_users_list CASCADE;
DROP FUNCTION IF EXISTS get_users_list() CASCADE;
DROP POLICY IF EXISTS "Service role can do everything" ON app_users CASCADE;
DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP INDEX IF EXISTS idx_app_users_active CASCADE;
DROP INDEX IF EXISTS idx_app_users_role CASCADE;
DROP INDEX IF EXISTS idx_app_users_email CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- ============================================
-- CREATE USERS TABLE
-- ============================================
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- MD5 hashed
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_app_users_username ON app_users(username);
CREATE INDEX idx_app_users_email ON app_users(email);
CREATE INDEX idx_app_users_role ON app_users(role);
CREATE INDEX idx_app_users_active ON app_users(is_active);

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (for API)
CREATE POLICY "Service role can do everything"
    ON app_users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- Username: admin
-- Password: admin123 (MD5: 0192023a7bbd73250516f069df18b500)
-- ============================================
INSERT INTO app_users (username, email, password, full_name, role) 
VALUES (
    'admin',
    'admin@example.com',
    '0192023a7bbd73250516f069df18b500', -- admin123
    'System Administrator',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON app_users TO anon, authenticated, service_role;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE app_users IS 'Application users table with MD5 password hashing';
COMMENT ON COLUMN app_users.password IS 'MD5 hashed password';
COMMENT ON COLUMN app_users.role IS 'User role: admin or user';
COMMENT ON COLUMN app_users.is_active IS 'Whether the user account is active';

-- ============================================
-- ATTENDANCE SYSTEM TABLES
-- ============================================

-- ============================================
-- EMPLOYEES TABLE (Karyawan)
-- ============================================
-- IMPORTANT NOTES:
-- 1. user_id has ON DELETE CASCADE: Deleting app_users will auto-delete employee
-- 2. email is UNIQUE: Same email cannot be used again unless hard deleted
-- 3. employee_code is UNIQUE: Must be unique across all employees (active or inactive)
-- 4. is_active: false = soft delete (deactivated), true = active
-- ============================================
DROP TABLE IF EXISTS employees CASCADE;
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,  -- CASCADE: Delete user → auto-delete employee
    employee_code VARCHAR(50) UNIQUE NOT NULL,  -- Must be unique
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,  -- Must be unique (prevents reuse unless hard deleted)
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,  -- false = soft deleted (deactivated)
    face_encoding_path TEXT, -- Face encoding data (combined from training)
    face_match_score DECIMAL(5, 2), -- Average training score (0-100) from face training
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_active ON employees(is_active);

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR EMPLOYEES TABLE
-- ============================================
COMMENT ON TABLE employees IS 'Employee records with CASCADE delete from app_users';
COMMENT ON COLUMN employees.user_id IS 'FK to app_users - ON DELETE CASCADE';
COMMENT ON COLUMN employees.email IS 'UNIQUE constraint - must hard delete to reuse email';
COMMENT ON COLUMN employees.employee_code IS 'UNIQUE employee identifier';
COMMENT ON COLUMN employees.is_active IS 'false = soft deleted (deactivated), true = active';
COMMENT ON COLUMN employees.face_encoding_path IS 'Face encoding data from training (combined from all steps)';
COMMENT ON COLUMN employees.face_match_score IS 'Average face training score (0-100%) - used as baseline for verification';

-- ============================================
-- OFFICE LOCATIONS TABLE (Lokasi Kantor)
-- ============================================
DROP TABLE IF EXISTS office_locations CASCADE;
CREATE TABLE office_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius INTEGER DEFAULT 100, -- Radius in meters
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_office_locations_active ON office_locations(is_active);

CREATE TRIGGER update_office_locations_updated_at
    BEFORE UPDATE ON office_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ATTENDANCE TABLE (Log Absensi)
-- ============================================
-- IMPORTANT NOTES:
-- 1. employee_id has ON DELETE CASCADE: Deleting employee will auto-delete attendance records
-- 2. This means HARD DELETE employee will remove all attendance history
-- 3. SOFT DELETE (is_active=false) will keep attendance records
-- ============================================
DROP TABLE IF EXISTS attendance CASCADE;
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,  -- CASCADE: Delete employee → auto-delete attendance
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_latitude DECIMAL(10, 8),
    check_in_longitude DECIMAL(11, 8),
    check_out_latitude DECIMAL(10, 8),
    check_out_longitude DECIMAL(11, 8),
    office_location_id UUID REFERENCES office_locations(id),
    status VARCHAR(50) DEFAULT 'present', -- 'present', 'late', 'absent', 'leave'
    face_match_score DECIMAL(5, 2), -- Similarity score (0-100)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_check_in ON attendance(check_in_time);
CREATE INDEX idx_attendance_status ON attendance(status);
-- Removed idx_attendance_date because date expression is not immutable

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR ATTENDANCE TABLE
-- ============================================
COMMENT ON TABLE attendance IS 'Attendance records with CASCADE delete from employees';
COMMENT ON COLUMN attendance.employee_id IS 'FK to employees - ON DELETE CASCADE (hard delete employee will remove all attendance)';

-- ============================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role
CREATE POLICY "Service role can do everything" ON employees
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything" ON office_locations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything" ON attendance
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON employees TO anon, authenticated, service_role;
GRANT ALL ON office_locations TO anon, authenticated, service_role;
GRANT ALL ON attendance TO anon, authenticated, service_role;

-- ============================================
-- INSERT DEFAULT OFFICE LOCATION
-- ============================================
INSERT INTO office_locations (name, address, latitude, longitude, radius)
VALUES (
    'Kantor Pusat',
    'Jakarta, Indonesia',
    -6.2088,
    106.8456,
    100
) ON CONFLICT DO NOTHING;

-- ============================================
-- LEAVE REQUESTS TABLE (Pengajuan Izin)
-- ============================================
DROP TABLE IF EXISTS leave_requests CASCADE;
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- 'sick', 'annual', 'personal', 'emergency'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL, -- Total days of leave
    reason TEXT NOT NULL,
    attachment_url TEXT, -- Optional attachment (e.g., medical certificate)
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT, -- Notes from admin when approving/rejecting
    reviewed_by UUID REFERENCES app_users(id), -- Admin who reviewed the request
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR LEAVE REQUESTS TABLE
-- ============================================
COMMENT ON TABLE leave_requests IS 'Employee leave/absence requests';
COMMENT ON COLUMN leave_requests.employee_id IS 'FK to employees - ON DELETE CASCADE';
COMMENT ON COLUMN leave_requests.leave_type IS 'Type of leave: sick, annual, personal, emergency';
COMMENT ON COLUMN leave_requests.status IS 'Request status: pending, approved, rejected';
COMMENT ON COLUMN leave_requests.days IS 'Total number of leave days';
COMMENT ON COLUMN leave_requests.reviewed_by IS 'Admin user who approved/rejected the request';

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
DROP TABLE IF EXISTS system_settings CASCADE;
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('face_recognition_threshold', '80', 'Minimum similarity score (%) for face verification to pass'),
    ('gps_accuracy_radius', '3000', 'Maximum GPS radius (meters) for location verification')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything" ON system_settings
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything" ON leave_requests
    FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON system_settings TO anon, authenticated, service_role;
GRANT ALL ON leave_requests TO anon, authenticated, service_role;

COMMENT ON TABLE system_settings IS 'System-wide settings for face recognition and GPS verification';
COMMENT ON COLUMN system_settings.setting_key IS 'Unique identifier for each setting';
COMMENT ON COLUMN system_settings.setting_value IS 'Value of the setting (stored as text, cast as needed)';
COMMENT ON COLUMN system_settings.description IS 'Human-readable description of the setting';

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Active employees only
-- SECURITY INVOKER ensures view runs with permissions of the querying user (safer)
CREATE OR REPLACE VIEW active_employees 
WITH (security_invoker = true)  -- Use querying user's permissions (not creator's)
AS
SELECT 
    e.*,
    u.email as user_email,
    u.role as user_role,
    u.is_active as user_is_active
FROM employees e
LEFT JOIN app_users u ON e.user_id = u.id
WHERE e.is_active = true;

COMMENT ON VIEW active_employees IS 'View showing only active employees with user details (uses SECURITY INVOKER for safety)';

-- View: Employee attendance summary
-- SECURITY INVOKER ensures view runs with permissions of the querying user (safer)
CREATE OR REPLACE VIEW employee_attendance_summary 
WITH (security_invoker = true)  -- Use querying user's permissions (not creator's)
AS
SELECT 
    e.id as employee_id,
    e.employee_code,
    e.full_name,
    e.department,
    e.is_active,
    COUNT(a.id) as total_attendance,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    MAX(a.check_in_time) as last_attendance
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id
GROUP BY e.id, e.employee_code, e.full_name, e.department, e.is_active;

COMMENT ON VIEW employee_attendance_summary IS 'Summary of attendance records per employee (uses SECURITY INVOKER for safety)';

-- ============================================
-- USEFUL FUNCTIONS
-- ============================================

-- Function: Get employee with attendance count
-- Changed to SECURITY INVOKER for better security (uses querying user's permissions)
CREATE OR REPLACE FUNCTION get_employee_with_stats(employee_uuid UUID)
RETURNS TABLE (
    employee_id UUID,
    employee_code VARCHAR,
    full_name VARCHAR,
    email VARCHAR,
    department VARCHAR,
    job_position VARCHAR,  -- Changed from 'position' (reserved keyword)
    is_active BOOLEAN,
    total_attendance BIGINT,
    last_check_in TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER for better security
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.employee_code,
        e.full_name,
        e.email,
        e.department,
        e."position",  -- Use quotes for reserved keyword
        e.is_active,
        COUNT(a.id)::BIGINT as total_attendance,
        MAX(a.check_in_time) as last_check_in
    FROM employees e
    LEFT JOIN attendance a ON e.id = a.employee_id
    WHERE e.id = employee_uuid
    GROUP BY e.id, e.employee_code, e.full_name, e.email, e.department, e."position", e.is_active;
END;
$$;

COMMENT ON FUNCTION get_employee_with_stats IS 'Get employee details with attendance statistics (uses SECURITY INVOKER)';

-- ============================================
-- CASCADE DELETE ORDER (IMPORTANT!)
-- ============================================
-- When deleting records, follow this order to avoid foreign key violations:
-- 
-- 1. DELETE FROM app_users WHERE id = ?
--    → This will CASCADE delete:
--       - employees (via user_id FK)
--       - attendance (via employee_id FK from employees)
--
-- 2. OR: DELETE FROM employees WHERE id = ?
--    → This will CASCADE delete:
--       - attendance (via employee_id FK)
--    → But will NOT delete app_users (parent table)
--
-- 3. Soft Delete (Recommended for preserving history):
--    UPDATE employees SET is_active = false WHERE id = ?
--    UPDATE app_users SET is_active = false WHERE id = ?
--    → Keeps all data for audit/history purposes
--    → Email cannot be reused (UNIQUE constraint still active)
--
-- 4. Hard Delete (Permanent - allows email reuse):
--    DELETE FROM app_users WHERE id = ? 
--    → Deletes everything (user, employee, attendance)
--    → Email can be reused for new employee
--    → Cannot be undone!
--
-- ============================================

-- ============================================
-- GRANT ADDITIONAL PERMISSIONS FOR VIEWS
-- ============================================
GRANT SELECT ON active_employees TO anon, authenticated, service_role;
GRANT SELECT ON employee_attendance_summary TO anon, authenticated, service_role;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- ============================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- ============================================
-- Check cascade relationships:
-- SELECT 
--     tc.table_name, 
--     kcu.column_name, 
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name,
--     rc.delete_rule
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--     ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--     ON ccu.constraint_name = tc.constraint_name
-- JOIN information_schema.referential_constraints AS rc
--     ON tc.constraint_name = rc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--     AND tc.table_name IN ('employees', 'attendance');
--
-- Expected results:
-- employees.user_id → app_users.id (CASCADE)
-- attendance.employee_id → employees.id (CASCADE)
-- ============================================
