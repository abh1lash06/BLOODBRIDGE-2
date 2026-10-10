package com.bloodbridge.bloodrequest;

import com.bloodbridge.bloodrequest.dto.BloodRequestCreateDTO;
import com.bloodbridge.bloodrequest.dto.BloodRequestResponse;
import com.bloodbridge.bloodrequest.dto.BloodRequestUpdateDTO;
import com.bloodbridge.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blood-requests")
public class BloodRequestController {

    private final BloodRequestService bloodRequestService;

    public BloodRequestController(BloodRequestService bloodRequestService) {
        this.bloodRequestService = bloodRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<BloodRequestResponse> createRequest(@AuthenticationPrincipal UserPrincipal currentUser,
                                                              @Valid @RequestBody BloodRequestCreateDTO dto) {
        BloodRequestResponse response = bloodRequestService.createRequest(currentUser, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Page<BloodRequestResponse>> getMyRequests(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                    Pageable pageable) {
        return ResponseEntity.ok(bloodRequestService.getMyRequests(currentUser, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BloodRequestResponse> getRequestById(@AuthenticationPrincipal UserPrincipal currentUser,
                                                               @PathVariable Long id) {
        return ResponseEntity.ok(bloodRequestService.getRequestById(currentUser, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BloodRequestResponse> updateRequest(@AuthenticationPrincipal UserPrincipal currentUser,
                                                              @PathVariable Long id,
                                                              @Valid @RequestBody BloodRequestUpdateDTO dto) {
        return ResponseEntity.ok(bloodRequestService.updateRequest(currentUser, id, dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BloodRequestResponse> cancelRequest(@AuthenticationPrincipal UserPrincipal currentUser,
                                                              @PathVariable Long id) {
        return ResponseEntity.ok(bloodRequestService.cancelRequest(currentUser, id));
    }

    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('HOSPITAL','ADMIN')")
    public ResponseEntity<Page<BloodRequestResponse>> getOpenRequests(Pageable pageable) {
        return ResponseEntity.ok(bloodRequestService.getOpenRequests(pageable));
    }

    @GetMapping("/hospital")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Page<BloodRequestResponse>> getHospitalRequests(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                          Pageable pageable) {
        return ResponseEntity.ok(bloodRequestService.getHospitalRequests(currentUser, pageable));
    }

    @PostMapping("/{id}/respond")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<com.bloodbridge.bloodrequest.dto.DonorResponseDTO> respondToRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestBody(required = false) com.bloodbridge.bloodrequest.dto.DonorRespondRequest dto) {
        return ResponseEntity.ok(bloodRequestService.respondToRequest(currentUser, id, dto));
    }

    @GetMapping("/{id}/responses")
    public ResponseEntity<java.util.List<com.bloodbridge.bloodrequest.dto.DonorResponseDTO>> getRequestResponses(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        return ResponseEntity.ok(bloodRequestService.getRequestResponses(currentUser, id));
    }

    @GetMapping("/matching")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<Page<BloodRequestResponse>> getMatchingRequests(
            @AuthenticationPrincipal UserPrincipal currentUser,
            Pageable pageable) {
        return ResponseEntity.ok(bloodRequestService.getMatchingRequestsForDonor(currentUser, pageable));
    }
}
