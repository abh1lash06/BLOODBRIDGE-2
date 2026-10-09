package com.bloodbridge.auth.dto;

import com.bloodbridge.common.Role;
import java.time.LocalDateTime;

public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        String phoneNumber,
        LocalDateTime createdAt
) {}
