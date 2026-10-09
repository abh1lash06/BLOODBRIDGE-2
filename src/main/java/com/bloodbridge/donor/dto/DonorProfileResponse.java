package com.bloodbridge.donor.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DonorProfileResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String phoneNumber,
        String bloodGroup,
        LocalDate dateOfBirth,
        String gender,
        String address,
        String city,
        String state,
        String verificationStatus,
        Boolean availableToDonate,
        LocalDate lastDonationDate,
        LocalDateTime createdAt
) {}
