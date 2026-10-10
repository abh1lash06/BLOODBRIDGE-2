package com.bloodbridge.donor;
import java.util.List;
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
Page<DonorProfile> findByVerificationStatusAndAvailableToDonateAndBloodGroup(
        VerificationStatus status, boolean available, BloodGroup bloodGroup, Pageable pageable);
List<DonorProfile> findAllByVerificationStatusAndAvailableToDonateAndBloodGroup(
        VerificationStatus status,
        boolean available,
        BloodGroup bloodGroup);
    List<DonorProfile> findByVerificationStatusAndAvailableToDonateAndBloodGroupIn(
        VerificationStatus status,
        boolean available,
        java.util.Collection<BloodGroup> bloodGroups);
}
