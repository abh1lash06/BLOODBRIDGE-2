package com.bloodbridge.hospital.dto;

import com.bloodbridge.common.VerificationStatus;
import java.time.LocalDateTime;

public record HospitalResponse(
    Long id,
    String hospitalName,
    String registrationNumber,
    String address,
    String city,
    String state,
    String contactPhone,
    VerificationStatus verificationStatus,
    LocalDateTime createdAt
) {}
