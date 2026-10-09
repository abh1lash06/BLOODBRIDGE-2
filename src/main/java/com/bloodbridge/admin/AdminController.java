package com.bloodbridge.admin;

import com.bloodbridge.admin.dto.CreateHospitalAccountRequest;
import com.bloodbridge.admin.dto.HospitalAccountResponse;
import com.bloodbridge.admin.dto.RejectRequest;
import com.bloodbridge.donor.dto.DonorProfileResponse;
import com.bloodbridge.hospital.dto.HospitalResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/donors/pending")
    public ResponseEntity<Page<DonorProfileResponse>> getPendingDonors(Pageable pageable) {
        return ResponseEntity.ok(adminService.getPendingDonors(pageable));
    }

    @PatchMapping("/donors/{donorProfileId}/verify")
    public ResponseEntity<DonorProfileResponse> verifyDonor(@PathVariable Long donorProfileId) {
        return ResponseEntity.ok(adminService.verifyDonor(donorProfileId));
    }

    @PatchMapping("/donors/{donorProfileId}/reject")
    public ResponseEntity<DonorProfileResponse> rejectDonor(@PathVariable Long donorProfileId,
                                                            @Valid @RequestBody(required = false) RejectRequest rejectRequest) {
        String reason = rejectRequest != null ? rejectRequest.reason() : null;
        return ResponseEntity.ok(adminService.rejectDonor(donorProfileId, reason));
    }

    @GetMapping("/hospitals/pending")
    public ResponseEntity<Page<HospitalResponse>> getPendingHospitals(Pageable pageable) {
        return ResponseEntity.ok(adminService.getPendingHospitals(pageable));
    }

    @PatchMapping("/hospitals/{hospitalId}/verify")
    public ResponseEntity<HospitalResponse> verifyHospital(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(adminService.verifyHospital(hospitalId));
    }

    @PatchMapping("/hospitals/{hospitalId}/unverify")
    public ResponseEntity<HospitalResponse> unverifyHospital(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(adminService.unverifyHospital(hospitalId));
    }

    @PostMapping("/hospitals/accounts")
    public ResponseEntity<HospitalAccountResponse> createHospitalAccount(@Valid @RequestBody CreateHospitalAccountRequest request) {
        HospitalAccountResponse response = adminService.createHospitalAccount(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
