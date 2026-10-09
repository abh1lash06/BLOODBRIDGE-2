package com.bloodbridge.bloodrequest.dto;

import com.bloodbridge.common.RequestStatus;
import com.bloodbridge.common.Urgency;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BloodRequestResponse(
    Long id,
    Long patientId,
    String patientName,
    Long hospitalId,
    String hospitalName,
    String bloodGroup,
    String bloodGroupCode,
    Integer unitsRequired,
    Urgency urgency,
    LocalDate requiredDate,
    String notes,
    RequestStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
