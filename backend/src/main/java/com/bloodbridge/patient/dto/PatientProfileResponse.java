package com.bloodbridge.patient.dto;

import java.time.LocalDateTime;

public record PatientProfileResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String phoneNumber,
        String address,
        String city,
        String state,
        String emergencyContactName,
        String emergencyContactPhone,
        LocalDateTime createdAt
) {}
