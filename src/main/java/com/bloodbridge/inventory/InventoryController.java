package com.bloodbridge.inventory;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.inventory.dto.InventoryResponse;
import com.bloodbridge.inventory.dto.InventoryUpdateRequest;
import com.bloodbridge.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/my-hospital")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<List<InventoryResponse>> getMyHospitalInventory(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(inventoryService.getHospitalInventory(principal));
    }

    @PutMapping("/my-hospital")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<InventoryResponse> updateInventory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InventoryUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(principal, request));
    }

    @GetMapping("/search")
    public ResponseEntity<List<InventoryResponse>> searchInventory(@RequestParam BloodGroup bloodGroup) {
        return ResponseEntity.ok(inventoryService.getInventoryByBloodGroup(bloodGroup));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<InventoryResponse>> getPublicHospitalInventory(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(inventoryService.getPublicHospitalInventory(hospitalId));
    }
}
