package com.bloodbridge.bloodrequest;

import com.bloodbridge.bloodrequest.donorresponse.DonorResponse;
import com.bloodbridge.bloodrequest.donorresponse.DonorResponseRepository;
import com.bloodbridge.bloodrequest.dto.BloodRequestCreateDTO;
import com.bloodbridge.bloodrequest.dto.BloodRequestResponse;
import com.bloodbridge.bloodrequest.dto.BloodRequestUpdateDTO;
import com.bloodbridge.bloodrequest.dto.DonorRespondRequest;
import com.bloodbridge.bloodrequest.dto.DonorResponseDTO;
import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.NotificationType;
import com.bloodbridge.common.RequestStatus;
import com.bloodbridge.common.Role;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donation.DonationService;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
import com.bloodbridge.exception.BadRequestException;
import com.bloodbridge.exception.DuplicateResourceException;
import com.bloodbridge.exception.ForbiddenException;
import com.bloodbridge.exception.InvalidStateTransitionException;
import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.hospital.Hospital;
import com.bloodbridge.hospital.HospitalRepository;
import com.bloodbridge.notification.NotificationService;
import com.bloodbridge.patient.PatientProfile;
import com.bloodbridge.patient.PatientProfileRepository;
import com.bloodbridge.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final HospitalRepository hospitalRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final DonorResponseRepository donorResponseRepository;
    private final NotificationService notificationService;
    private final DonationService donationService;

    public BloodRequestService(BloodRequestRepository bloodRequestRepository,
                               PatientProfileRepository patientProfileRepository,
                               HospitalRepository hospitalRepository,
                               DonorProfileRepository donorProfileRepository,
                               DonorResponseRepository donorResponseRepository,
                               NotificationService notificationService,
                               DonationService donationService) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.hospitalRepository = hospitalRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.donorResponseRepository = donorResponseRepository;
        this.notificationService = notificationService;
        this.donationService = donationService;
    }

    public BloodRequestResponse createRequest(UserPrincipal currentUser, BloodRequestCreateDTO dto) {
        if (currentUser.getRole() != Role.PATIENT) {
            throw new ForbiddenException("Only patients can create blood requests");
        }

        PatientProfile patientProfile = patientProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Hospital hospital = null;
        if (dto.hospitalId() != null) {
            hospital = hospitalRepository.findById(dto.hospitalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        }

        BloodRequest request = new BloodRequest();
        request.setPatient(patientProfile);
        request.setHospital(hospital);
        request.setBloodGroup(dto.bloodGroup());
        request.setUnitsRequired(dto.unitsRequired());
        request.setUrgency(dto.urgency());
        request.setRequiredDate(dto.requiredDate());
        request.setNotes(dto.notes());
        request.setStatus(RequestStatus.PENDING);

        BloodRequest saved = bloodRequestRepository.save(request);

        // Notify patient of successful creation
        notificationService.createNotification(
                patientProfile.getUser(),
                "Blood Request Created",
                "Your blood request #" + saved.getId() + " for " + saved.getUnitsRequired()
                        + " units of " + saved.getBloodGroup().getLabel()
                        + " (" + saved.getUrgency().name() + ") has been created successfully.",
                NotificationType.BLOOD_REQUEST_CREATED
        );

        // Notify assigned hospital facility if present
        if (hospital != null && hospital.getUser() != null) {
            notificationService.createNotification(
                    hospital.getUser(),
                    "New Assigned Blood Request",
                    "New emergency blood request #" + saved.getId() + " for " + saved.getUnitsRequired()
                            + " units of " + saved.getBloodGroup().getLabel()
                            + " (" + saved.getUrgency().name() + ") has been assigned to your facility.",
                    NotificationType.BLOOD_REQUEST_CREATED
            );
        }

        // Notify all eligible matching donors based on clinical compatibility (ABO + Rh)
        Set<Long> notifiedUserIds = new HashSet<>();
        if (patientProfile.getUser() != null && patientProfile.getUser().getId() != null) {
            notifiedUserIds.add(patientProfile.getUser().getId());
        }

        List<BloodGroup> compatibleDonorGroups = saved.getBloodGroup().getCompatibleDonorGroups();
        List<DonorProfile> matchingDonors = donorProfileRepository.findByVerificationStatusAndAvailableToDonateAndBloodGroupIn(
                VerificationStatus.VERIFIED,
                true,
                compatibleDonorGroups
        );

        if (matchingDonors != null && !matchingDonors.isEmpty()) {
            for (DonorProfile donor : matchingDonors) {
                if (donor != null && donor.getUser() != null && donor.getUser().getId() != null) {
                    Long donorUserId = donor.getUser().getId();
                    if (!notifiedUserIds.contains(donorUserId) && donor.getUser().isEnabled()) {
                        notifiedUserIds.add(donorUserId);
                        notificationService.createNotification(
                                donor.getUser(),
                                "Matching Blood Request",
                                "A new blood request for " + saved.getBloodGroup().getLabel()
                                        + " (" + saved.getUrgency().name() + ") has been created. Units required: "
                                        + saved.getUnitsRequired() + ". Please check BloodBridge for details.",
                                NotificationType.BLOOD_REQUEST_CREATED
                        );
                    }
                }
            }
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getMyRequests(UserPrincipal currentUser, Pageable pageable) {
        PatientProfile patientProfile = patientProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return bloodRequestRepository.findByPatientId(patientProfile.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BloodRequestResponse getRequestById(UserPrincipal currentUser, Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found with ID: " + requestId));

        boolean canAccess = false;
        if (currentUser.getRole() == Role.ADMIN) {
            canAccess = true;
        } else if (currentUser.getRole() == Role.PATIENT) {
            canAccess = request.getPatient().getUser().getId().equals(currentUser.getId());
        } else if (currentUser.getRole() == Role.HOSPITAL) {
            canAccess = true;
        } else if (currentUser.getRole() == Role.DONOR) {
            // Verified donors can view request details to evaluate responding
            canAccess = true;
        }

        if (!canAccess) {
            throw new ForbiddenException("Not authorized to view this request");
        }

        return toResponse(request);
    }

    public BloodRequestResponse updateRequest(UserPrincipal currentUser, Long requestId, BloodRequestUpdateDTO dto) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found with ID: " + requestId));

        boolean canEdit = false;
        if (currentUser.getRole() == Role.ADMIN) {
            canEdit = true;
        } else if (currentUser.getRole() == Role.PATIENT) {
            canEdit = request.getPatient().getUser().getId().equals(currentUser.getId());
        } else if (currentUser.getRole() == Role.HOSPITAL && request.getHospital() != null) {
            canEdit = request.getHospital().getUser().getId().equals(currentUser.getId());
        }

        if (!canEdit) {
            throw new ForbiddenException("Not authorized to edit this request");
        }

        if (dto.status() != null && dto.status() != request.getStatus()) {
            if (!request.getStatus().canTransitionTo(dto.status())) {
                throw new InvalidStateTransitionException(
                        "Cannot transition request from " + request.getStatus() + " to " + dto.status());
            }
            request.setStatus(dto.status());

            // If request transitions to FULFILLED, automatically record verified donations for accepted donors
            if (dto.status() == RequestStatus.FULFILLED) {
                List<DonorResponse> acceptedResponses = donorResponseRepository.findByBloodRequestIdAndStatusOrderByRespondedAtAsc(requestId, "ACCEPTED");
                for (DonorResponse resp : acceptedResponses) {
                    DonorProfile donor = resp.getDonor();
                    donationService.recordDonation(
                            donor,
                            request,
                            request.getHospital(),
                            1,
                            LocalDate.now(),
                            "Fulfilled emergency blood request #" + request.getId()
                    );

                    // Notify donor of completed donation
                    if (donor.getUser() != null) {
                        notificationService.createNotification(
                                donor.getUser(),
                                "Donation Fulfilled & Recorded",
                                "Your donation for emergency blood request #" + request.getId()
                                        + " has been verified and recorded in your donation history. Thank you for your life-saving contribution!",
                                NotificationType.BLOOD_REQUEST_FULFILLED
                        );
                    }
                }
            }

            notificationService.createNotification(
                    request.getPatient().getUser(),
                    "Blood Request Status Updated",
                    "Your blood request #" + request.getId() + " status has been updated to " + dto.status(),
                    NotificationType.STATUS_UPDATE
            );
        }

        if (request.getStatus() == RequestStatus.PENDING) {
            if (dto.unitsRequired() != null) {
                request.setUnitsRequired(dto.unitsRequired());
            }
            if (dto.urgency() != null) {
                request.setUrgency(dto.urgency());
            }
            if (dto.requiredDate() != null) {
                request.setRequiredDate(dto.requiredDate());
            }
            if (dto.notes() != null) {
                request.setNotes(dto.notes());
            }
        }

        BloodRequest saved = bloodRequestRepository.save(request);
        return toResponse(saved);
    }

    public BloodRequestResponse cancelRequest(UserPrincipal currentUser, Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found with ID: " + requestId));

        if (!request.getPatient().getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Not authorized to cancel this request");
        }

        if (!request.getStatus().canTransitionTo(RequestStatus.CANCELLED)) {
            throw new InvalidStateTransitionException(
                    "Cannot cancel request in status: " + request.getStatus());
        }

        request.setStatus(RequestStatus.CANCELLED);
        BloodRequest saved = bloodRequestRepository.save(request);

        notificationService.createNotification(
                request.getPatient().getUser(),
                "Blood Request Cancelled",
                "Your blood request #" + request.getId() + " has been cancelled.",
                NotificationType.STATUS_UPDATE
        );

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getOpenRequests(Pageable pageable) {
        return bloodRequestRepository.findByStatus(RequestStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getHospitalRequests(UserPrincipal currentUser, Pageable pageable) {
        Hospital hospital = hospitalRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found for user: " + currentUser.getId()));
        return bloodRequestRepository.findByHospitalId(hospital.getId(), pageable)
                .map(this::toResponse);
    }

    /**
     * Responds to an emergency blood request as an authenticated donor (Accept or Decline).
     */
    public DonorResponseDTO respondToRequest(UserPrincipal currentUser, Long requestId, DonorRespondRequest dto) {
        if (currentUser.getRole() != Role.DONOR) {
            throw new ForbiddenException("Only registered donors can respond to blood requests");
        }

        DonorProfile donor = donorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for user: " + currentUser.getId()));

        if (donor.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Your donor account must be verified by administrators before accepting blood requests");
        }

        if (!donor.isAvailableToDonate()) {
            throw new BadRequestException("You are currently marked as unavailable for donation. Please update your availability first.");
        }

        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.PENDING && request.getStatus() != RequestStatus.APPROVED) {
            throw new BadRequestException("This blood request is in status " + request.getStatus() + " and is no longer accepting donor responses.");
        }

        if (donor.getBloodGroup() == null || !request.getBloodGroup().canReceiveFrom(donor.getBloodGroup())) {
            throw new BadRequestException("Clinical incompatibility: Recipient (" + request.getBloodGroup().getLabel()
                    + ") cannot safely receive from donor blood group (" + (donor.getBloodGroup() != null ? donor.getBloodGroup().getLabel() : "Unspecified") + ")");
        }

        if (donorResponseRepository.existsByBloodRequestIdAndDonorId(requestId, donor.getId())) {
            throw new DuplicateResourceException("You have already responded to blood request #" + requestId);
        }

        String action = (dto != null && dto.action() != null && dto.action().equalsIgnoreCase("DECLINE")) ? "DECLINED" : "ACCEPTED";

        if ("ACCEPTED".equals(action)) {
            long currentAccepted = donorResponseRepository.countByBloodRequestIdAndStatus(requestId, "ACCEPTED");
            if (currentAccepted >= request.getUnitsRequired()) {
                throw new BadRequestException("This blood request has already reached its required donor response capacity (" + request.getUnitsRequired() + " units).");
            }
        }

        DonorResponse response = new DonorResponse();
        response.setBloodRequest(request);
        response.setDonor(donor);
        response.setStatus(action);
        response.setNotes(dto != null ? dto.notes() : null);
        response.setRespondedAt(LocalDateTime.now());

        DonorResponse saved = donorResponseRepository.save(response);

        // If donor accepted, notify patient and hospital
        if ("ACCEPTED".equals(action)) {
            String donorPhone = (donor.getUser() != null && donor.getUser().getPhoneNumber() != null && !donor.getUser().getPhoneNumber().isBlank())
                    ? donor.getUser().getPhoneNumber() : "Coordinates via hospital";

            notificationService.createNotification(
                    request.getPatient().getUser(),
                    "Donor Responded: Blood Request #" + request.getId(),
                    "Donor " + donor.getUser().getFullName() + " (" + donor.getBloodGroup().getLabel()
                            + ") has accepted your blood request #" + request.getId() + ". Authorized Contact Phone: " + donorPhone,
                    NotificationType.STATUS_UPDATE
            );

            if (request.getHospital() != null && request.getHospital().getUser() != null) {
                notificationService.createNotification(
                        request.getHospital().getUser(),
                        "Donor Accepted Request #" + request.getId(),
                        "Donor " + donor.getUser().getFullName() + " (" + donor.getBloodGroup().getLabel()
                                + ") has accepted blood request #" + request.getId() + ". Please coordinate pre-transfusion screening.",
                        NotificationType.STATUS_UPDATE
                );
            }
        }

        return toDonorResponseDTO(saved);
    }

    /**
     * Retrieves the list of donor responses for a blood request.
     * Accessible by the owning patient, assigned hospital, admin, or responded donor.
     */
    @Transactional(readOnly = true)
    public List<DonorResponseDTO> getRequestResponses(UserPrincipal currentUser, Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found with ID: " + requestId));

        boolean canAccess = false;
        if (currentUser.getRole() == Role.ADMIN) {
            canAccess = true;
        } else if (currentUser.getRole() == Role.PATIENT) {
            canAccess = request.getPatient().getUser().getId().equals(currentUser.getId());
        } else if (currentUser.getRole() == Role.HOSPITAL && request.getHospital() != null) {
            canAccess = request.getHospital().getUser().getId().equals(currentUser.getId());
        } else if (currentUser.getRole() == Role.DONOR) {
            DonorProfile donor = donorProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            canAccess = (donor != null && donorResponseRepository.existsByBloodRequestIdAndDonorId(requestId, donor.getId()));
        }

        if (!canAccess) {
            throw new ForbiddenException("You do not have permission to view donor responses for this blood request");
        }

        return donorResponseRepository.findByBloodRequestIdOrderByRespondedAtAsc(requestId)
                .stream()
                .map(this::toDonorResponseDTO)
                .toList();
    }

    /**
     * Returns open blood requests clinically compatible with the authenticated donor's blood group.
     */
    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getMatchingRequestsForDonor(UserPrincipal currentUser, Pageable pageable) {
        DonorProfile donor = donorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for user: " + currentUser.getId()));

        if (donor.getBloodGroup() == null) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        List<BloodGroup> recipientGroups = donor.getBloodGroup().getCompatibleRecipientGroups();
        return bloodRequestRepository.findByStatusInAndBloodGroupIn(
                List.of(RequestStatus.PENDING, RequestStatus.APPROVED),
                recipientGroups,
                pageable
        ).map(this::toResponse);
    }

    private BloodRequestResponse toResponse(BloodRequest request) {
        return new BloodRequestResponse(
                request.getId(),
                request.getPatient().getId(),
                request.getPatient().getUser().getFullName(),
                request.getHospital() != null ? request.getHospital().getId() : null,
                request.getHospital() != null ? request.getHospital().getHospitalName() : null,
                request.getBloodGroup().getLabel(),
                request.getBloodGroup().name(),
                request.getUnitsRequired(),
                request.getUrgency(),
                request.getRequiredDate(),
                request.getNotes(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    private DonorResponseDTO toDonorResponseDTO(DonorResponse response) {
        DonorProfile donor = response.getDonor();
        String donorName = (donor != null && donor.getUser() != null) ? donor.getUser().getFullName() : "Anonymous Donor";
        String donorPhone = (donor != null && donor.getUser() != null) ? donor.getUser().getPhoneNumber() : null;
        String donorCity = (donor != null) ? donor.getCity() : null;
        String bloodGroupLabel = (donor != null && donor.getBloodGroup() != null) ? donor.getBloodGroup().getLabel() : null;
        String bloodGroupCode = (donor != null && donor.getBloodGroup() != null) ? donor.getBloodGroup().name() : null;

        return new DonorResponseDTO(
                response.getId(),
                response.getBloodRequest().getId(),
                donor != null ? donor.getId() : null,
                donorName,
                bloodGroupLabel,
                bloodGroupCode,
                donorPhone,
                donorCity,
                response.getStatus(),
                response.getNotes(),
                response.getRespondedAt()
        );
    }
}
