package com.bloodbridge.bloodrequest.donorresponse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonorResponseRepository extends JpaRepository<DonorResponse, Long> {
    List<DonorResponse> findByBloodRequestIdOrderByRespondedAtAsc(Long bloodRequestId);
    List<DonorResponse> findByBloodRequestIdAndStatusOrderByRespondedAtAsc(Long bloodRequestId, String status);
    List<DonorResponse> findByDonorIdOrderByRespondedAtDesc(Long donorId);
    Optional<DonorResponse> findByBloodRequestIdAndDonorId(Long bloodRequestId, Long donorId);
    boolean existsByBloodRequestIdAndDonorId(Long bloodRequestId, Long donorId);
    long countByBloodRequestIdAndStatus(Long bloodRequestId, String status);
    void deleteByBloodRequestId(Long bloodRequestId);
}
