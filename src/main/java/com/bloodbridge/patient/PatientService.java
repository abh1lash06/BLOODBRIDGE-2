package com.bloodbridge.patient;

import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.patient.dto.PatientProfileResponse;
import com.bloodbridge.patient.dto.PatientProfileUpdateRequest;
import com.bloodbridge.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;

    public PatientService(PatientProfileRepository patientProfileRepository) {
        this.patientProfileRepository = patientProfileRepository;
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getMyProfile(UserPrincipal currentUser) {
        PatientProfile profile = patientProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user"));
        return toResponse(profile);
    }

    @Transactional
    public PatientProfileResponse updateProfile(UserPrincipal currentUser, PatientProfileUpdateRequest request) {
        PatientProfile profile = patientProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user"));

        profile.setAddress(request.address());
        profile.setCity(request.city());
        profile.setState(request.state());
        profile.setEmergencyContactName(request.emergencyContactName());
        profile.setEmergencyContactPhone(request.emergencyContactPhone());

        PatientProfile savedProfile = patientProfileRepository.save(profile);
        return toResponse(savedProfile);
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getPatientProfileByUserId(Long userId) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user ID: " + userId));
        return toResponse(profile);
    }

    private PatientProfileResponse toResponse(PatientProfile profile) {
        return new PatientProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getFullName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhoneNumber(),
                profile.getAddress(),
                profile.getCity(),
                profile.getState(),
                profile.getEmergencyContactName(),
                profile.getEmergencyContactPhone(),
                profile.getCreatedAt()
        );
    }
}
