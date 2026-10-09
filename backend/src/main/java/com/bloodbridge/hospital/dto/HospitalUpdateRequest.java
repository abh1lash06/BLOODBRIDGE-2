package com.bloodbridge.hospital.dto;

import jakarta.validation.constraints.Size;

public record HospitalUpdateRequest(
    @Size(max = 255) String hospitalName,
    @Size(max = 500) String address,
    @Size(max = 100) String city,
    @Size(max = 100) String state,
    @Size(max = 20) String contactPhone
) {}
