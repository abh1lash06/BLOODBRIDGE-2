package com.bloodbridge.bloodrequest.dto;

import com.bloodbridge.common.RequestStatus;
import com.bloodbridge.common.Urgency;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record BloodRequestUpdateDTO(
    @Min(1) @Max(100) Integer unitsRequired,
    Urgency urgency,
    @Future LocalDate requiredDate,
    @Size(max = 1000) String notes,
    RequestStatus status
) {}
