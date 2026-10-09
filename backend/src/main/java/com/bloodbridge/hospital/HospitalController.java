package com.bloodbridge.hospital;

import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.hospital.dto.HospitalResponse;
import com.bloodbridge.hospital.dto.HospitalUpdateRequest;
import com.bloodbridge.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;
    private final HospitalRepository hospitalRepository;

    public HospitalController(HospitalService hospitalService, HospitalRepository hospitalRepository) {
        this.hospitalService = hospitalService;
        this.hospitalRepository = hospitalRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<HospitalResponse> getMyHospital(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(hospitalService.getMyHospital(principal));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<HospitalResponse> updateHospital(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HospitalUpdateRequest request) {
        return ResponseEntity.ok(hospitalService.updateHospital(principal, request));
    }

    @GetMapping("/me/verification")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<VerificationStatus> getVerificationStatus(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(hospitalService.getVerificationStatus(principal));
    }

    @GetMapping
    public ResponseEntity<Page<HospitalResponse>> getHospitals(Pageable pageable) {
        Page<Hospital> verifiedHospitals = hospitalRepository.findByVerificationStatus(VerificationStatus.VERIFIED, pageable);
        Page<HospitalResponse> response = verifiedHospitals.map(h -> new HospitalResponse(
                h.getId(), h.getHospitalName(), h.getRegistrationNumber(),
                h.getAddress(), h.getCity(), h.getState(), h.getContactPhone(),
                h.getVerificationStatus(), h.getCreatedAt()
        ));
        return ResponseEntity.ok(response);
    }
}
