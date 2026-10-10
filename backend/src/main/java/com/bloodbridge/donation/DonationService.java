package com.bloodbridge.donation;

import com.bloodbridge.bloodrequest.BloodRequest;
import com.bloodbridge.donation.dto.DonationResponse;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.hospital.Hospital;
import com.bloodbridge.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonorProfileRepository donorProfileRepository;

    public DonationService(DonationRepository donationRepository,
                           DonorProfileRepository donorProfileRepository) {
        this.donationRepository = donationRepository;
        this.donorProfileRepository = donorProfileRepository;
    }

    @Transactional(readOnly = true)
    public Page<DonationResponse> getMyDonations(UserPrincipal currentUser, Pageable pageable) {
        DonorProfile donor = donorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for user ID: " + currentUser.getId()));

        return donationRepository.findByDonorIdOrderByDonationDateDesc(donor.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public Donation recordDonation(DonorProfile donor,
                                  BloodRequest request,
                                  Hospital hospital,
                                  int units,
                                  LocalDate date,
                                  String notes) {
        LocalDate donationDate = (date != null) ? date : LocalDate.now();

        Donation donation = new Donation();
        donation.setDonor(donor);
        donation.setBloodRequest(request);
        donation.setHospital(hospital);
        donation.setBloodGroup(donor.getBloodGroup() != null ? donor.getBloodGroup() : request.getBloodGroup());
        donation.setUnitsDonated(units > 0 ? units : 1);
        donation.setDonationDate(donationDate);
        donation.setStatus("COMPLETED");
        donation.setNotes(notes);

        donor.setLastDonationDate(donationDate);
        donorProfileRepository.save(donor);

        return donationRepository.save(donation);
    }

    private DonationResponse mapToResponse(Donation donation) {
        String donorName = donation.getDonor() != null && donation.getDonor().getUser() != null
                ? donation.getDonor().getUser().getFullName() : null;
        Long hospitalId = donation.getHospital() != null ? donation.getHospital().getId() : null;
        String hospitalName = donation.getHospital() != null ? donation.getHospital().getHospitalName() : null;
        Long requestId = donation.getBloodRequest() != null ? donation.getBloodRequest().getId() : null;

        return new DonationResponse(
                donation.getId(),
                donation.getDonor() != null ? donation.getDonor().getId() : null,
                donorName,
                requestId,
                hospitalId,
                hospitalName,
                donation.getBloodGroup() != null ? donation.getBloodGroup().getLabel() : null,
                donation.getBloodGroup() != null ? donation.getBloodGroup().name() : null,
                donation.getUnitsDonated(),
                donation.getDonationDate(),
                donation.getStatus(),
                donation.getNotes(),
                donation.getCreatedAt()
        );
    }
}
