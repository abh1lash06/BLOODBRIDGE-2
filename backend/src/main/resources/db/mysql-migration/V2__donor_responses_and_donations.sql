-- BloodBridge Database Schema V2 for MySQL
-- Flyway Migration: Donor Responses and Donations

-- Donor responses table
CREATE TABLE IF NOT EXISTS donor_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blood_request_id BIGINT NOT NULL,
    donor_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED',
    notes VARCHAR(500),
    responded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donor_responses_request FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_donor_responses_donor FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uk_request_donor UNIQUE (blood_request_id, donor_id)
);
CREATE INDEX idx_donor_responses_request_id ON donor_responses(blood_request_id);
CREATE INDEX idx_donor_responses_donor_id ON donor_responses(donor_id);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    blood_request_id BIGINT NULL,
    hospital_id BIGINT NULL,
    blood_group VARCHAR(15) NOT NULL,
    units_donated INT NOT NULL DEFAULT 1,
    donation_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_donations_request FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_donations_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_blood_request_id ON donations(blood_request_id);
CREATE INDEX idx_donations_hospital_id ON donations(hospital_id);
