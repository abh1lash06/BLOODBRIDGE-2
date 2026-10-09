package com.bloodbridge.bloodrequest.dto;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.Urgency;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record BloodRequestCreateDTO(
    @NotNull BloodGroup bloodGroup,
    @NotNull @Min(1) @Max(100) Integer unitsRequired,
    @NotNull Urgency urgency,
    @NotNull @Future LocalDate requiredDate,
    Long hospitalId,
    @Size(max = 1000) String notes
) {}
