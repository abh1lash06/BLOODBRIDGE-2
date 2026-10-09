package com.bloodbridge.admin.dto;

import com.bloodbridge.common.VerificationStatus;

public record HospitalAccountResponse(
    Long userId,
    String email,
    String fullName,
    Long hospitalId,
    String hospitalName,
    String registrationNumber,
    VerificationStatus verificationStatus
) {}
