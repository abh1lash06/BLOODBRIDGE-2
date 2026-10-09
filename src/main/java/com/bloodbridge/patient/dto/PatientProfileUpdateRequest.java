package com.bloodbridge.patient.dto;

import jakarta.validation.constraints.Size;

public record PatientProfileUpdateRequest(
        @Size(max = 500, message = "Address must not exceed 500 characters")
        String address,

        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @Size(max = 100, message = "State must not exceed 100 characters")
        String state,

        @Size(max = 20, message = "Emergency contact name must not exceed 20 characters")
        String emergencyContactName,

        @Size(max = 20, message = "Emergency contact phone must not exceed 20 characters")
        String emergencyContactPhone
) {}
