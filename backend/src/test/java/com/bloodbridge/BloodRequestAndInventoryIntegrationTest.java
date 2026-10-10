package com.bloodbridge;

import com.bloodbridge.auth.dto.RegisterRequest;
import com.bloodbridge.bloodrequest.BloodRequest;
import com.bloodbridge.bloodrequest.BloodRequestRepository;
import com.bloodbridge.bloodrequest.dto.BloodRequestCreateDTO;
import com.bloodbridge.bloodrequest.dto.BloodRequestUpdateDTO;
import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.RequestStatus;
import com.bloodbridge.common.Role;
import com.bloodbridge.common.Urgency;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.hospital.Hospital;
import com.bloodbridge.hospital.HospitalRepository;
import com.bloodbridge.inventory.BloodInventory;
import com.bloodbridge.inventory.BloodInventoryRepository;
import com.bloodbridge.inventory.dto.InventoryUpdateRequest;
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
import org.springframework.test.web.servlet.MvcResult;

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
class BloodRequestAndInventoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private BloodInventoryRepository inventoryRepository;

    @Autowired
    private BloodRequestRepository bloodRequestRepository;

    @Autowired
    private com.bloodbridge.donor.DonorProfileRepository donorProfileRepository;

    @Autowired
    private com.bloodbridge.patient.PatientProfileRepository patientProfileRepository;

    @Autowired
    private com.bloodbridge.notification.NotificationRepository notificationRepository;

    @Autowired
    private com.bloodbridge.bloodrequest.donorresponse.DonorResponseRepository donorResponseRepository;

    @Autowired
    private com.bloodbridge.donation.DonationRepository donationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        donationRepository.deleteAll();
        donorResponseRepository.deleteAll();
        notificationRepository.deleteAll();
        bloodRequestRepository.deleteAll();
        inventoryRepository.deleteAll();
        donorProfileRepository.deleteAll();
        patientProfileRepository.deleteAll();
        hospitalRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String createPatientAndGetToken(String email) throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "Patient User",
                email,
                "Password123!",
                Role.PATIENT,
                "1234567890"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(email).orElseThrow();
        return jwtTokenProvider.generateToken(UserPrincipal.create(user));
    }

    private String createHospitalUserAndGetToken(String email, VerificationStatus status) {
        User user = new User();
        user.setFullName("General Hospital Staff");
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("HospPass123!"));
        user.setRole(Role.HOSPITAL);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);

        Hospital hospital = new Hospital();
        hospital.setUser(savedUser);
        hospital.setHospitalName("City General Hospital");
        hospital.setRegistrationNumber("REG-" + System.currentTimeMillis());
        hospital.setCity("Metropolis");
        hospital.setState("NY");
        hospital.setVerificationStatus(status);
        hospitalRepository.save(hospital);

        return jwtTokenProvider.generateToken(UserPrincipal.create(savedUser));
    }

    @Test
    @DisplayName("Patient creates blood request and views own requests")
    void testPatientBloodRequestFlow() throws Exception {
        String patientToken = createPatientAndGetToken("patient.req@example.com");

        BloodRequestCreateDTO createDTO = new BloodRequestCreateDTO(
                BloodGroup.O_POSITIVE,
                3,
                Urgency.URGENT,
                LocalDate.now().plusDays(5),
                null,
                "Needed for upcoming scheduled surgery"
        );

        MvcResult result = mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bloodGroupCode", is("O_POSITIVE")))
                .andExpect(jsonPath("$.unitsRequired", is(3)))
                .andExpect(jsonPath("$.urgency", is("URGENT")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andReturn();

        Long requestId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

        // Patient views own requests
        mockMvc.perform(get("/api/blood-requests/my")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(requestId.intValue())));

        // Patient cancels own request
        mockMvc.perform(patch("/api/blood-requests/" + requestId + "/cancel")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @DisplayName("Invalid blood requests (zero units, past date) are rejected with 400")
    void testInvalidBloodRequestValidation() throws Exception {
        String patientToken = createPatientAndGetToken("patient.invalid@example.com");

        // Zero units required
        BloodRequestCreateDTO zeroUnitsDTO = new BloodRequestCreateDTO(
                BloodGroup.A_POSITIVE,
                0, // invalid: min is 1
                Urgency.NORMAL,
                LocalDate.now().plusDays(3),
                null,
                "Notes"
        );
        mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(zeroUnitsDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("VALIDATION_ERROR")));

        // Past required date
        BloodRequestCreateDTO pastDateDTO = new BloodRequestCreateDTO(
                BloodGroup.A_POSITIVE,
                2,
                Urgency.NORMAL,
                LocalDate.now().minusDays(1), // invalid: must be future
                null,
                "Notes"
        );
        mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pastDateDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("VALIDATION_ERROR")));
    }

    @Test
    @DisplayName("Illegal blood request status transitions are rejected with 400")
    void testIllegalStateTransitionRejection() throws Exception {
        String patientToken = createPatientAndGetToken("patient.trans@example.com");

        BloodRequestCreateDTO createDTO = new BloodRequestCreateDTO(
                BloodGroup.B_POSITIVE,
                1,
                Urgency.NORMAL,
                LocalDate.now().plusDays(7),
                null,
                "Routine request"
        );
        MvcResult res = mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andReturn();

        Long requestId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();

        // Cancel it (PENDING -> CANCELLED is legal)
        mockMvc.perform(patch("/api/blood-requests/" + requestId + "/cancel")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk());

        // Now try CANCELLED -> APPROVED (illegal transition)
        BloodRequestUpdateDTO illegalTransition = new BloodRequestUpdateDTO(
                null, null, null, null, RequestStatus.APPROVED
        );

        mockMvc.perform(put("/api/blood-requests/" + requestId)
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(illegalTransition)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("INVALID_STATE_TRANSITION")));
    }

    @Test
    @DisplayName("Verified hospital can update inventory, negative units rejected, unverified hospital forbidden")
    void testHospitalInventoryFlow() throws Exception {
        // 1. Unverified hospital attempts to update inventory -> 403 Forbidden
        String unverifiedToken = createHospitalUserAndGetToken("unverified.hosp@example.com", VerificationStatus.PENDING);
        InventoryUpdateRequest updateReq = new InventoryUpdateRequest(BloodGroup.A_POSITIVE, 10);

        mockMvc.perform(put("/api/inventory/my-hospital")
                        .header("Authorization", "Bearer " + unverifiedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));

        // 2. Verified hospital updates inventory -> 200 OK
        String verifiedToken = createHospitalUserAndGetToken("verified.hosp@example.com", VerificationStatus.VERIFIED);

        mockMvc.perform(put("/api/inventory/my-hospital")
                        .header("Authorization", "Bearer " + verifiedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableUnits", is(10)))
                .andExpect(jsonPath("$.bloodGroupCode", is("A_POSITIVE")));

        // 3. Negative available units rejected by Bean Validation -> 400
        InventoryUpdateRequest negativeReq = new InventoryUpdateRequest(BloodGroup.A_POSITIVE, -5);
        mockMvc.perform(put("/api/inventory/my-hospital")
                        .header("Authorization", "Bearer " + verifiedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(negativeReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }
}
