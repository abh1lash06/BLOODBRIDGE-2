package com.bloodbridge.donor;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donor.dto.DonorProfileResponse;
import com.bloodbridge.donor.dto.DonorProfileUpdateRequest;
import com.bloodbridge.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final DonorService donorService;
    private final com.bloodbridge.donation.DonationService donationService;

    public DonorController(DonorService donorService,
                           com.bloodbridge.donation.DonationService donationService) {
        this.donorService = donorService;
        this.donationService = donationService;
    }

    @GetMapping("/me/donations")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<Page<com.bloodbridge.donation.dto.DonationResponse>> getMyDonations(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int pageSize = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, pageSize);
        return ResponseEntity.ok(donationService.getMyDonations(currentUser, pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonorProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donorService.getMyProfile(currentUser));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonorProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody DonorProfileUpdateRequest request) {
        return ResponseEntity.ok(donorService.updateProfile(currentUser, request));
    }

    @GetMapping("/me/verification")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<VerificationStatus> getVerificationStatus(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donorService.getVerificationStatus(currentUser));
    }

    @GetMapping
    public ResponseEntity<Page<DonorProfileResponse>> listVerifiedDonors(
            @RequestParam(required = false) BloodGroup bloodGroup,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int pageSize = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, pageSize);
        return ResponseEntity.ok(donorService.listVerifiedDonors(bloodGroup, pageable));
    }
}
