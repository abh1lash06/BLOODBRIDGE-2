package com.bloodbridge.bloodrequest;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    Page<BloodRequest> findByPatientId(Long patientId, Pageable pageable);
    Page<BloodRequest> findByHospitalId(Long hospitalId, Pageable pageable);
    Page<BloodRequest> findByStatus(RequestStatus status, Pageable pageable);
    Page<BloodRequest> findByBloodGroupAndStatus(BloodGroup bloodGroup, RequestStatus status, Pageable pageable);
    List<BloodRequest> findByPatientIdAndStatus(Long patientId, RequestStatus status);
}
