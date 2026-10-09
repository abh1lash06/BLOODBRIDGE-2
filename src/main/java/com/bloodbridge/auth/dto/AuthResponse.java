package com.bloodbridge.auth.dto;

import com.bloodbridge.common.Role;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        Role role
) {}
