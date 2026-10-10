package com.bloodbridge.donation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DonationResponse(
    Long id,
    Long donorId,
    String donorName,
    Long bloodRequestId,
    Long hospitalId,
    String hospitalName,
    String bloodGroup,
    String bloodGroupCode,
    Integer unitsDonated,
    LocalDate donationDate,
    String status,
    String notes,
    LocalDateTime createdAt
) {}
