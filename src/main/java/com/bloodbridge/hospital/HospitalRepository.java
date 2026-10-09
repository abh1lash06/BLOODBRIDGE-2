package com.bloodbridge.hospital;
import com.bloodbridge.common.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByUserId(Long userId);
    Optional<Hospital> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
    Page<Hospital> findByVerificationStatus(VerificationStatus status, Pageable pageable);
    boolean existsByUserId(Long userId);
}
