package com.bloodbridge.inventory;

import com.bloodbridge.common.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {
    List<BloodInventory> findByHospitalId(Long hospitalId);
    Optional<BloodInventory> findByHospitalIdAndBloodGroup(Long hospitalId, BloodGroup bloodGroup);
    List<BloodInventory> findByBloodGroupAndAvailableUnitsGreaterThan(BloodGroup bloodGroup, int minUnits);
}
