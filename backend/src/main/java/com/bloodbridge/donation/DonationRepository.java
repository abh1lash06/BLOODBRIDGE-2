package com.bloodbridge.donation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    Page<Donation> findByDonorIdOrderByDonationDateDesc(Long donorId, Pageable pageable);
    List<Donation> findByDonorIdOrderByDonationDateDesc(Long donorId);
    Page<Donation> findByDonorUserIdOrderByDonationDateDesc(Long userId, Pageable pageable);
    boolean existsByBloodRequestIdAndDonorId(Long bloodRequestId, Long donorId);
    long countByDonorId(Long donorId);
}
