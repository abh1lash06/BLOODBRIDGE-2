package com.bloodbridge.bloodrequest.dto;

import java.time.LocalDateTime;

public record DonorResponseDTO(
    Long responseId,
    Long requestId,
    Long donorId,
    String donorName,
    String donorBloodGroup,
    String donorBloodGroupCode,
    String donorPhone,
    String donorCity,
    String status,
    String notes,
    LocalDateTime respondedAt
) {}
