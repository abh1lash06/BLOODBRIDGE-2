package com.bloodbridge.bloodrequest.dto;

public record DonorRespondRequest(
    String action, // ACCEPT, DECLINE
    String notes
) {}
