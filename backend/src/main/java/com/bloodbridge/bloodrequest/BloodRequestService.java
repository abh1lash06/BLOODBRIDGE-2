
package com.bloodbridge.bloodrequest;

import com.bloodbridge.bloodrequest.dto.BloodRequestCreateDTO;
import com.bloodbridge.bloodrequest.dto.BloodRequestResponse;
import com.bloodbridge.bloodrequest.dto.BloodRequestUpdateDTO;
import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.NotificationType;
import com.bloodbridge.common.RequestStatus;
import com.bloodbridge.common.Role;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final HospitalRepository hospitalRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final NotificationService notificationService;

    public BloodRequestService(BloodRequestRepository bloodRequestRepository,
                               PatientProfileRepository patientProfileRepository,
                               HospitalRepository hospitalRepository,
                               DonorProfileRepository donorProfileRepository,
                               NotificationService notificationService) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.hospitalRepository = hospitalRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.notificationService = notificationService;
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

        notificationService.createNotification(
                patientProfile.getUser(),
                "Blood Request Created",
                "Your blood request for " + request.getUnitsRequired()
                        + " units of " + request.getBloodGroup().getLabel()
                        + " has been created successfully.",
                NotificationType.BLOOD_REQUEST_CREATED
        );

        List<DonorProfile> matchingDonors =
                donorProfileRepository.findAllByVerificationStatusAndAvailableToDonateAndBloodGroup(
                        VerificationStatus.VERIFIED,
                        true,
                        request.getBloodGroup()
                );

        for (DonorProfile donor : matchingDonors) {
            notificationService.createNotification(
                    donor.getUser(),
                    "Matching Blood Request",
                    "A new blood request for " + request.getBloodGroup().getLabel()
                            + " has been created. Units required: "
                            + request.getUnitsRequired()
                            + ". Please check BloodBridge for details.",
                    NotificationType.BLOOD_REQUEST_CREATED
            );
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
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));

        boolean canAccess = false;
        if (currentUser.getRole() == Role.ADMIN) {
            canAccess = true;
        } else if (currentUser.getRole() == Role.PATIENT) {
            canAccess = request.getPatient().getUser().getId().equals(currentUser.getId());
        } else if (currentUser.getRole() == Role.HOSPITAL && request.getHospital() != null) {
            canAccess = request.getHospital().getUser().getId().equals(currentUser.getId());
        }

        if (!canAccess) {
            throw new ForbiddenException("Not authorized to view this request");
        }

        return toResponse(request);
    }

    public BloodRequestResponse updateRequest(UserPrincipal currentUser, Long requestId, BloodRequestUpdateDTO dto) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));

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

            notificationService.createNotification(
                    request.getPatient().getUser(),
                    "Blood Request Status Updated",
                    "Your blood request status has been updated to " + dto.status(),
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
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));

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
                "Your blood request has been cancelled successfully.",
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
                .orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found"));
        return bloodRequestRepository.findByHospitalId(hospital.getId(), pageable)
                .map(this::toResponse);
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
}
