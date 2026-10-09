package com.bloodbridge.inventory;

import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.hospital.Hospital;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_inventory",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_inventory_hospital_blood_group",
        columnNames = {"hospital_id", "blood_group"}
    ),
    indexes = {
        @Index(name = "idx_blood_inventory_hospital_id", columnList = "hospital_id"),
        @Index(name = "idx_blood_inventory_blood_group", columnList = "blood_group")
    }
)
public class BloodInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false, length = 15)
    private BloodGroup bloodGroup;

    @Column(name = "available_units", nullable = false)
    private int availableUnits = 0;

    @Column(name = "reserved_units", nullable = false)
    private int reservedUnits = 0;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Version
    private Long version;

    public BloodInventory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Hospital getHospital() { return hospital; }
    public void setHospital(Hospital hospital) { this.hospital = hospital; }
    public BloodGroup getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(BloodGroup bloodGroup) { this.bloodGroup = bloodGroup; }
    public int getAvailableUnits() { return availableUnits; }
    public void setAvailableUnits(int availableUnits) { this.availableUnits = availableUnits; }
    public int getReservedUnits() { return reservedUnits; }
    public void setReservedUnits(int reservedUnits) { this.reservedUnits = reservedUnits; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
