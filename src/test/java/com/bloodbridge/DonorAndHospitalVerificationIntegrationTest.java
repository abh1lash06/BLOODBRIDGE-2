package com.bloodbridge;

import com.bloodbridge.admin.dto.CreateHospitalAccountRequest;
import com.bloodbridge.admin.dto.RejectRequest;
import com.bloodbridge.auth.dto.RegisterRequest;
import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.Gender;
import com.bloodbridge.common.Role;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
import com.bloodbridge.donor.dto.DonorProfileUpdateRequest;
import com.bloodbridge.hospital.Hospital;
import com.bloodbridge.hospital.HospitalRepository;
import com.bloodbridge.security.JwtTokenProvider;
import com.bloodbridge.security.UserPrincipal;
import com.bloodbridge.user.User;
import com.bloodbridge.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DonorAndHospitalVerificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorProfileRepository donorProfileRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private com.bloodbridge.patient.PatientProfileRepository patientProfileRepository;

    @Autowired
    private com.bloodbridge.bloodrequest.BloodRequestRepository bloodRequestRepository;

    @Autowired
    private com.bloodbridge.inventory.BloodInventoryRepository inventoryRepository;

    @Autowired
    private com.bloodbridge.notification.NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        bloodRequestRepository.deleteAll();
        inventoryRepository.deleteAll();
        donorProfileRepository.deleteAll();
        patientProfileRepository.deleteAll();
        hospitalRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String getAdminToken() {
        User admin = new User();
        admin.setFullName("Admin User");
        admin.setEmail("admin.test@example.com");
        admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        User saved = userRepository.save(admin);

        return jwtTokenProvider.generateToken(UserPrincipal.create(saved));
    }

    @Test
    @DisplayName("Admin can list pending donors, verify donor, and reject donor with reason")
    void testDonorVerificationWorkflow() throws Exception {
        String adminToken = getAdminToken();

        // Register a donor
        RegisterRequest registerReq = new RegisterRequest(
                "Pending Donor",
                "pending.donor@example.com",
                "Password123!",
                Role.DONOR,
                "1234567890"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        User donorUser = userRepository.findByEmail("pending.donor@example.com").orElseThrow();
        DonorProfile donorProfile = donorProfileRepository.findByUserId(donorUser.getId()).orElseThrow();

        // 1. Admin gets pending donors
        mockMvc.perform(get("/api/admin/donors/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].verificationStatus", is("PENDING")));

        // 2. Admin verifies the donor
        mockMvc.perform(patch("/api/admin/donors/" + donorProfile.getId() + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("VERIFIED")));

        // 3. Register a second donor to reject
        RegisterRequest rejectDonorReq = new RegisterRequest(
                "Reject Donor",
                "reject.donor@example.com",
                "Password123!",
                Role.DONOR,
                "9876543210"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectDonorReq)))
                .andExpect(status().isCreated());

        User secondDonor = userRepository.findByEmail("reject.donor@example.com").orElseThrow();
        DonorProfile secondProfile = donorProfileRepository.findByUserId(secondDonor.getId()).orElseThrow();

        // 4. Admin rejects with reason
        RejectRequest rejectRequest = new RejectRequest("Incomplete documentation provided");
        mockMvc.perform(patch("/api/admin/donors/" + secondProfile.getId() + "/reject")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("REJECTED")));
    }

    @Test
    @DisplayName("Admin can create hospital account, verify and unverify hospital")
    void testHospitalCreationAndVerification() throws Exception {
        String adminToken = getAdminToken();

        CreateHospitalAccountRequest createHospitalReq = new CreateHospitalAccountRequest(
                "Dr. John Chief",
                "hospital.admin@metrocare.com",
                "HospitalPass123!",
                "9876500000",
                "Metro General Hospital",
                "REG-HOSP-9900",
                "123 Healthcare Blvd",
                "Metropolis",
                "NY",
                "2125551234"
        );

        // 1. Admin creates hospital account
        mockMvc.perform(post("/api/admin/hospitals/accounts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createHospitalReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hospitalName", is("Metro General Hospital")))
                .andExpect(jsonPath("$.registrationNumber", is("REG-HOSP-9900")));

        Hospital hospital = hospitalRepository.findByRegistrationNumber("REG-HOSP-9900").orElseThrow();

        // 2. Admin unverifies hospital
        mockMvc.perform(patch("/api/admin/hospitals/" + hospital.getId() + "/unverify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("UNVERIFIED")));

        // 3. Admin re-verifies hospital
        mockMvc.perform(patch("/api/admin/hospitals/" + hospital.getId() + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("VERIFIED")));
    }

    @Test
    @DisplayName("Donor cannot self-verify through profile update endpoint")
    void testDonorCannotSelfVerify() throws Exception {
        // Register donor
        RegisterRequest registerReq = new RegisterRequest(
                "Self Verify Donor",
                "self.verify@example.com",
                "Password123!",
                Role.DONOR,
                "5554443333"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        User donorUser = userRepository.findByEmail("self.verify@example.com").orElseThrow();
        String donorToken = jwtTokenProvider.generateToken(UserPrincipal.create(donorUser));

        // Attempt profile update
        DonorProfileUpdateRequest updateReq = new DonorProfileUpdateRequest(
                BloodGroup.O_POSITIVE,
                LocalDate.of(1995, 5, 20),
                Gender.MALE,
                "456 Elm Street",
                "Springfield",
                "IL",
                true
        );

        mockMvc.perform(put("/api/donors/me")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloodGroup", is("O+")))
                // verificationStatus must remain PENDING
                .andExpect(jsonPath("$.verificationStatus", is("PENDING")));

        // Verify in database as well
        DonorProfile dbProfile = donorProfileRepository.findByUserId(donorUser.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(VerificationStatus.PENDING, dbProfile.getVerificationStatus());
    }
}
