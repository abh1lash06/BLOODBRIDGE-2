package com.bloodbridge.admin;

import com.bloodbridge.admin.dto.CreateHospitalAccountRequest;
import com.bloodbridge.admin.dto.HospitalAccountResponse;
import com.bloodbridge.common.NotificationType;
import com.bloodbridge.common.Role;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
import com.bloodbridge.donor.dto.DonorProfileResponse;
import com.bloodbridge.exception.DuplicateResourceException;
import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.hospital.Hospital;
import com.bloodbridge.hospital.HospitalRepository;
import com.bloodbridge.hospital.dto.HospitalResponse;
import com.bloodbridge.notification.NotificationService;
import com.bloodbridge.user.User;
import com.bloodbridge.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AdminService {

    private final DonorProfileRepository donorProfileRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public AdminService(DonorProfileRepository donorProfileRepository,
                        HospitalRepository hospitalRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        NotificationService notificationService) {
        this.donorProfileRepository = donorProfileRepository;
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Page<DonorProfileResponse> getPendingDonors(Pageable pageable) {
        return donorProfileRepository.findByVerificationStatus(VerificationStatus.PENDING, pageable)
                .map(this::toDonorResponse);
    }

    public DonorProfileResponse verifyDonor(Long donorProfileId) {
        DonorProfile donor = donorProfileRepository.findById(donorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found"));
        donor.setVerificationStatus(VerificationStatus.VERIFIED);
        donor.setVerifiedAt(LocalDateTime.now());
        donor.setRejectionReason(null);
        donor = donorProfileRepository.save(donor);

        notificationService.createNotification(
                donor.getUser(),
                "Donor Verification Approved",
                "Your donor profile has been verified successfully.",
                NotificationType.ACCOUNT_UPDATE
        );

        return toDonorResponse(donor);
    }

    public DonorProfileResponse rejectDonor(Long donorProfileId, String reason) {
        DonorProfile donor = donorProfileRepository.findById(donorProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found"));
        donor.setVerificationStatus(VerificationStatus.REJECTED);
        donor.setRejectionReason(reason);
        donor.setVerifiedAt(null);
        donor = donorProfileRepository.save(donor);

        notificationService.createNotification(
                donor.getUser(),
                "Donor Verification Rejected",
                "Your donor profile has been rejected. Reason: " + (reason != null ? reason : "Not specified"),
                NotificationType.ACCOUNT_UPDATE
        );

        return toDonorResponse(donor);
    }

    @Transactional(readOnly = true)
    public Page<HospitalResponse> getPendingHospitals(Pageable pageable) {
        return hospitalRepository.findByVerificationStatus(VerificationStatus.PENDING, pageable)
                .map(this::toHospitalResponse);
    }

    public HospitalResponse verifyHospital(Long hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        hospital.setVerificationStatus(VerificationStatus.VERIFIED);
        hospital = hospitalRepository.save(hospital);

        notificationService.createNotification(
                hospital.getUser(),
                "Hospital Verification Approved",
                "Your hospital profile has been verified successfully.",
                NotificationType.ACCOUNT_UPDATE
        );

        return toHospitalResponse(hospital);
    }

    public HospitalResponse unverifyHospital(Long hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        hospital.setVerificationStatus(VerificationStatus.UNVERIFIED);
        hospital = hospitalRepository.save(hospital);

        notificationService.createNotification(
                hospital.getUser(),
                "Hospital Verification Revoked",
                "Your hospital profile verification has been revoked.",
                NotificationType.ACCOUNT_UPDATE
        );

        return toHospitalResponse(hospital);
    }

    public HospitalAccountResponse createHospitalAccount(CreateHospitalAccountRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already in use");
        }
        if (hospitalRepository.existsByRegistrationNumber(request.registrationNumber())) {
            throw new DuplicateResourceException("Hospital registration number already in use");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.HOSPITAL);
        user.setPhoneNumber(request.phoneNumber());
        user.setEnabled(true);
        user = userRepository.save(user);

        Hospital hospital = new Hospital();
        hospital.setUser(user);
        hospital.setHospitalName(request.hospitalName());
        hospital.setRegistrationNumber(request.registrationNumber());
        hospital.setAddress(request.address());
        hospital.setCity(request.city());
        hospital.setState(request.state());
        hospital.setContactPhone(request.contactPhone());
        hospital.setVerificationStatus(VerificationStatus.VERIFIED); 
        hospital = hospitalRepository.save(hospital);

        notificationService.createNotification(
                user,
                "Welcome to BloodBridge",
                "Your hospital account has been created by the administrator.",
                NotificationType.SYSTEM_ALERT
        );

        return new HospitalAccountResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                hospital.getId(),
                hospital.getHospitalName(),
                hospital.getRegistrationNumber(),
                hospital.getVerificationStatus()
        );
    }

    private DonorProfileResponse toDonorResponse(DonorProfile donor) {
        return new DonorProfileResponse(
                donor.getId(),
                donor.getUser().getId(),
                donor.getUser().getFullName(),
                donor.getUser().getEmail(),
                donor.getUser().getPhoneNumber(),
                donor.getBloodGroup() != null ? donor.getBloodGroup().getDisplayLabel() : null,
                donor.getDateOfBirth(),
                donor.getGender() != null ? donor.getGender().name() : null,
                donor.getAddress(),
                donor.getCity(),
                donor.getState(),
                donor.getVerificationStatus() != null ? donor.getVerificationStatus().name() : null,
                donor.isAvailableToDonate(),
                donor.getLastDonationDate(),
                donor.getCreatedAt()
        );
    }

    private HospitalResponse toHospitalResponse(Hospital hospital) {
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
