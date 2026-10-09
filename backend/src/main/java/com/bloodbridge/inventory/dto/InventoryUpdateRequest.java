package com.bloodbridge.inventory.dto;

import com.bloodbridge.common.BloodGroup;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryUpdateRequest(
    @NotNull BloodGroup bloodGroup,
    @NotNull @Min(0) Integer availableUnits
) {}
