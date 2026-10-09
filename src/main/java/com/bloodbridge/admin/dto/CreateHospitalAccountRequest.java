package com.bloodbridge.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateHospitalAccountRequest(
    @NotBlank @Size(max = 100) String fullName,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 100) String password,
    @Size(max = 20) String phoneNumber,
    @NotBlank @Size(max = 255) String hospitalName,
    @NotBlank @Size(max = 50) String registrationNumber,
    @Size(max = 500) String address,
    @Size(max = 100) String city,
    @Size(max = 100) String state,
    @Size(max = 20) String contactPhone
) {}
