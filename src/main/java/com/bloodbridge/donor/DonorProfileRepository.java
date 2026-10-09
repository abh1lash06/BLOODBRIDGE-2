package com.bloodbridge.donor;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long> {
    Optional<DonorProfile> findByUserId(Long userId);
    Page<DonorProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable);
    Page<DonorProfile> findByVerificationStatusAndBloodGroup(VerificationStatus status, BloodGroup bloodGroup, Pageable pageable);
    Page<DonorProfile> findByVerificationStatusAndAvailableToDonate(VerificationStatus status, boolean available, Pageable pageable);
    boolean existsByUserId(Long userId);
}
