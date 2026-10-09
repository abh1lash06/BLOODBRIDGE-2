-- BloodBridge Database Schema V1 for MySQL

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_users_email (email)
);
CREATE INDEX idx_users_email ON users(email);

-- Donor profiles
CREATE TABLE donor_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    blood_group VARCHAR(15),
    date_of_birth DATE,
    gender VARCHAR(10),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    verified_at TIMESTAMP NULL,
    available_to_donate BOOLEAN NOT NULL DEFAULT TRUE,
    last_donation_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_donor_profiles_blood_group ON donor_profiles(blood_group);
CREATE INDEX idx_donor_profiles_verification_status ON donor_profiles(verification_status);

-- Patient profiles
CREATE TABLE patient_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    emergency_contact_name VARCHAR(20),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hospitals
CREATE TABLE hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    contact_phone VARCHAR(20),
    user_id BIGINT NOT NULL UNIQUE,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hospital_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_hospitals_verification_status ON hospitals(verification_status);

-- Blood requests
CREATE TABLE blood_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    hospital_id BIGINT,
    blood_group VARCHAR(15) NOT NULL,
    units_required INT NOT NULL,
    urgency VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    required_date DATE NOT NULL,
    notes VARCHAR(1000),
    status VARCHAR(15) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_patient FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_request_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE INDEX idx_blood_requests_patient_id ON blood_requests(patient_id);
CREATE INDEX idx_blood_requests_hospital_id ON blood_requests(hospital_id);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests(blood_group);

-- Blood inventory
CREATE TABLE blood_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id BIGINT NOT NULL,
    blood_group VARCHAR(15) NOT NULL,
    available_units INT NOT NULL DEFAULT 0,
    reserved_units INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_inventory_hospital_blood_group UNIQUE (hospital_id, blood_group),
    CONSTRAINT fk_inventory_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
CREATE INDEX idx_blood_inventory_hospital_id ON blood_inventory(hospital_id);
CREATE INDEX idx_blood_inventory_blood_group ON blood_inventory(blood_group);

-- Notifications
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);
