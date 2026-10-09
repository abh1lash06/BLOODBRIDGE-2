package com.bloodbridge.hospital;

import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.exception.ForbiddenException;
import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.hospital.dto.HospitalResponse;
import com.bloodbridge.hospital.dto.HospitalUpdateRequest;
import com.bloodbridge.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public HospitalResponse getMyHospital(UserPrincipal principal) {
        return toResponse(getHospitalByUserId(principal.getId()));
    }

    @Transactional
    public HospitalResponse updateHospital(UserPrincipal principal, HospitalUpdateRequest request) {
        Hospital hospital = getHospitalByUserId(principal.getId());
        if (request.hospitalName() != null) {
            hospital.setHospitalName(request.hospitalName());
        }
        if (request.address() != null) {
            hospital.setAddress(request.address());
        }
        if (request.city() != null) {
            hospital.setCity(request.city());
        }
        if (request.state() != null) {
            hospital.setState(request.state());
        }
        if (request.contactPhone() != null) {
            hospital.setContactPhone(request.contactPhone());
        }
        return toResponse(hospitalRepository.save(hospital));
    }

    public VerificationStatus getVerificationStatus(UserPrincipal principal) {
        return getHospitalByUserId(principal.getId()).getVerificationStatus();
    }

    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
    }

    public Hospital getHospitalByUserId(Long userId) {
        return hospitalRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found for user"));
    }

    public boolean isVerified(Long userId) {
        Hospital hospital = hospitalRepository.findByUserId(userId).orElse(null);
        return hospital != null && hospital.getVerificationStatus() == VerificationStatus.VERIFIED;
    }

    public void requireVerified(UserPrincipal principal) {
        if (!isVerified(principal.getId())) {
            throw new ForbiddenException("Hospital is not verified");
        }
    }

    private HospitalResponse toResponse(Hospital hospital) {
        return new HospitalResponse(
                hospital.getId(),
                hospital.getHospitalName(),
                hospital.getRegistrationNumber(),
                hospital.getAddress(),
                hospital.getCity(),
                hospital.getState(),
                hospital.getContactPhone(),
                hospital.getVerificationStatus(),
                hospital.getCreatedAt()
        );
    }
}
