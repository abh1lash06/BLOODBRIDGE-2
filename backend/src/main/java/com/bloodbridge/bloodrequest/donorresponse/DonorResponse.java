package com.bloodbridge.bloodrequest.donorresponse;

import com.bloodbridge.bloodrequest.BloodRequest;
import com.bloodbridge.donor.DonorProfile;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donor_responses", uniqueConstraints = {
    @UniqueConstraint(name = "uk_request_donor", columnNames = {"blood_request_id", "donor_id"})
}, indexes = {
    @Index(name = "idx_donor_responses_request_id", columnList = "blood_request_id"),
    @Index(name = "idx_donor_responses_donor_id", columnList = "donor_id")
})
public class DonorResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blood_request_id", nullable = false)
    private BloodRequest bloodRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private DonorProfile donor;

    @Column(nullable = false, length = 20)
    private String status = "ACCEPTED";

    @Column(length = 500)
    private String notes;

    @Column(name = "responded_at", nullable = false)
    private LocalDateTime respondedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (respondedAt == null) {
            respondedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public DonorResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BloodRequest getBloodRequest() { return bloodRequest; }
    public void setBloodRequest(BloodRequest bloodRequest) { this.bloodRequest = bloodRequest; }
    public DonorProfile getDonor() { return donor; }
    public void setDonor(DonorProfile donor) { this.donor = donor; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
