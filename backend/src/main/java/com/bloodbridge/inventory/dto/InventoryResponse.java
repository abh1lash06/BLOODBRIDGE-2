package com.bloodbridge.inventory.dto;

import java.time.LocalDateTime;

public record InventoryResponse(
    Long id,
    Long hospitalId,
    String hospitalName,
    String bloodGroup,
    String bloodGroupCode,
    Integer availableUnits,
    Integer reservedUnits,
    LocalDateTime updatedAt
) {}
