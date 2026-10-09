-- BloodBridge Database Schema V1
-- Flyway Migration

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Donor profiles
CREATE TABLE donor_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    blood_group VARCHAR(15),
    date_of_birth DATE,
    gender VARCHAR(10),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    verified_at TIMESTAMP,
    available_to_donate BOOLEAN NOT NULL DEFAULT TRUE,
    last_donation_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_donor_profiles_user_id ON donor_profiles(user_id);
CREATE INDEX idx_donor_profiles_blood_group ON donor_profiles(blood_group);
CREATE INDEX idx_donor_profiles_verification_status ON donor_profiles(verification_status);

-- Patient profiles
CREATE TABLE patient_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    emergency_contact_name VARCHAR(20),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);

-- Hospitals
CREATE TABLE hospitals (
    id BIGSERIAL PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    contact_phone VARCHAR(20),
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_hospitals_registration_number ON hospitals(registration_number);
CREATE UNIQUE INDEX idx_hospitals_user_id ON hospitals(user_id);
CREATE INDEX idx_hospitals_verification_status ON hospitals(verification_status);

-- Blood requests
CREATE TABLE blood_requests (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patient_profiles(id),
    hospital_id BIGINT REFERENCES hospitals(id),
    blood_group VARCHAR(15) NOT NULL,
    units_required INT NOT NULL,
    urgency VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    required_date DATE NOT NULL,
    notes VARCHAR(1000),
    status VARCHAR(15) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blood_requests_patient_id ON blood_requests(patient_id);
CREATE INDEX idx_blood_requests_hospital_id ON blood_requests(hospital_id);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests(blood_group);

-- Blood inventory
CREATE TABLE blood_inventory (
    id BIGSERIAL PRIMARY KEY,
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    blood_group VARCHAR(15) NOT NULL,
    available_units INT NOT NULL DEFAULT 0,
    reserved_units INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_inventory_hospital_blood_group UNIQUE (hospital_id, blood_group),
    CONSTRAINT chk_available_units_non_negative CHECK (available_units >= 0),
    CONSTRAINT chk_reserved_units_non_negative CHECK (reserved_units >= 0)
);
CREATE INDEX idx_blood_inventory_hospital_id ON blood_inventory(hospital_id);
CREATE INDEX idx_blood_inventory_blood_group ON blood_inventory(blood_group);

-- Notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);
