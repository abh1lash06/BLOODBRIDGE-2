package com.bloodbridge.admin.dto;

import jakarta.validation.constraints.Size;

public record RejectRequest(
    @Size(max = 500) String reason
) {}
