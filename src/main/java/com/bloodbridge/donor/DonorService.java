package com.bloodbridge.donor;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donor.dto.DonorProfileResponse;
import com.bloodbridge.donor.dto.DonorProfileUpdateRequest;
import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonorService {

    private final DonorProfileRepository donorProfileRepository;

    public DonorService(DonorProfileRepository donorProfileRepository) {
        this.donorProfileRepository = donorProfileRepository;
    }

    @Transactional(readOnly = true)
    public DonorProfileResponse getMyProfile(UserPrincipal currentUser) {
        DonorProfile profile = donorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for current user"));
        return toResponse(profile);
    }

    @Transactional
    public DonorProfileResponse updateProfile(UserPrincipal currentUser, DonorProfileUpdateRequest request) {
        DonorProfile profile = donorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for current user"));

        profile.setBloodGroup(request.bloodGroup());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setGender(request.gender());
        profile.setAddress(request.address());
        profile.setCity(request.city());
        profile.setState(request.state());
        
        if (request.availableToDonate() != null) {
            profile.setAvailableToDonate(request.availableToDonate());
        }

        DonorProfile savedProfile = donorProfileRepository.save(profile);
        return toResponse(savedProfile);
    }

    @Transactional(readOnly = true)
    public VerificationStatus getVerificationStatus(UserPrincipal currentUser) {
        DonorProfile profile = donorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for current user"));
        return profile.getVerificationStatus();
    }

    @Transactional(readOnly = true)
    public Page<DonorProfileResponse> listVerifiedDonors(BloodGroup filter, Pageable pageable) {
        Page<DonorProfile> donors;
        if (filter != null) {
            donors = donorProfileRepository.findByVerificationStatusAndBloodGroup(VerificationStatus.VERIFIED, filter, pageable);
        } else {
            donors = donorProfileRepository.findByVerificationStatus(VerificationStatus.VERIFIED, pageable);
        }
        return donors.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DonorProfileResponse getDonorById(Long donorProfileId) {
        DonorProfile profile = donorProfileRepository.findById(donorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found with ID: " + donorProfileId));
        return toResponse(profile);
    }

    private DonorProfileResponse toResponse(DonorProfile profile) {
        return new DonorProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getFullName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhoneNumber(),
                profile.getBloodGroup() != null ? profile.getBloodGroup().getDisplayLabel() : null,
                profile.getDateOfBirth(),
                profile.getGender() != null ? profile.getGender().name() : null,
                profile.getAddress(),
                profile.getCity(),
                profile.getState(),
                profile.getVerificationStatus() != null ? profile.getVerificationStatus().name() : null,
                profile.getAvailableToDonate(),
                profile.getLastDonationDate(),
                profile.getCreatedAt()
        );
    }
}
