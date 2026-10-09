package com.bloodbridge.inventory;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.exception.BadRequestException;
import com.bloodbridge.hospital.Hospital;
import com.bloodbridge.hospital.HospitalService;
import com.bloodbridge.inventory.dto.InventoryResponse;
import com.bloodbridge.inventory.dto.InventoryUpdateRequest;
import com.bloodbridge.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryService {

    private final BloodInventoryRepository inventoryRepository;
    private final HospitalService hospitalService;

    public InventoryService(BloodInventoryRepository inventoryRepository, HospitalService hospitalService) {
        this.inventoryRepository = inventoryRepository;
        this.hospitalService = hospitalService;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getHospitalInventory(UserPrincipal principal) {
        hospitalService.requireVerified(principal);
        Hospital hospital = hospitalService.getHospitalByUserId(principal.getId());
        return inventoryRepository.findByHospitalId(hospital.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public InventoryResponse updateInventory(UserPrincipal principal, InventoryUpdateRequest request) {
        hospitalService.requireVerified(principal);
        Hospital hospital = hospitalService.getHospitalByUserId(principal.getId());
        
        if (request.availableUnits() < 0) {
            throw new BadRequestException("Available units cannot be negative");
        }

        BloodInventory inventory = inventoryRepository.findByHospitalIdAndBloodGroup(hospital.getId(), request.bloodGroup())
                .orElseGet(() -> {
                    BloodInventory newInventory = new BloodInventory();
                    newInventory.setHospital(hospital);
                    newInventory.setBloodGroup(request.bloodGroup());
                    newInventory.setAvailableUnits(0);
                    newInventory.setReservedUnits(0);
                    return newInventory;
                });

        inventory.setAvailableUnits(request.availableUnits());
        inventory.setUpdatedAt(LocalDateTime.now());
        
        return toResponse(inventoryRepository.save(inventory));
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventoryByBloodGroup(BloodGroup bloodGroup) {
        return inventoryRepository.findByBloodGroupAndAvailableUnitsGreaterThan(bloodGroup, 0).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getPublicHospitalInventory(Long hospitalId) {
        Hospital hospital = hospitalService.getHospitalById(hospitalId);
        if (!hospitalService.isVerified(hospital.getUser().getId())) {
            throw new BadRequestException("Hospital is not verified");
        }
        return inventoryRepository.findByHospitalId(hospitalId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private InventoryResponse toResponse(BloodInventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getHospital().getId(),
                inventory.getHospital().getHospitalName(),
                inventory.getBloodGroup().name().replace('_', ' '),
                inventory.getBloodGroup().name(),
                inventory.getAvailableUnits(),
                inventory.getReservedUnits(),
                inventory.getUpdatedAt()
        );
    }
}
