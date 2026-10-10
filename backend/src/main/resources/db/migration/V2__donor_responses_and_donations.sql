-- BloodBridge Database Schema V2
-- Flyway Migration: Donor Responses and Donations

-- Donor responses table
CREATE TABLE donor_responses (
    id BIGSERIAL PRIMARY KEY,
    blood_request_id BIGINT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id BIGINT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED',
    notes VARCHAR(500),
    responded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_request_donor UNIQUE (blood_request_id, donor_id)
);
CREATE INDEX idx_donor_responses_request_id ON donor_responses(blood_request_id);
CREATE INDEX idx_donor_responses_donor_id ON donor_responses(donor_id);

-- Donations table
CREATE TABLE donations (
    id BIGSERIAL PRIMARY KEY,
    donor_id BIGINT NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    blood_request_id BIGINT REFERENCES blood_requests(id) ON DELETE SET NULL,
    hospital_id BIGINT REFERENCES hospitals(id) ON DELETE SET NULL,
    blood_group VARCHAR(15) NOT NULL,
    units_donated INT NOT NULL DEFAULT 1,
    donation_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_blood_request_id ON donations(blood_request_id);
CREATE INDEX idx_donations_hospital_id ON donations(hospital_id);
