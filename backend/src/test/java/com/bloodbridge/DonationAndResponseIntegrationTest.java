package com.bloodbridge;

import com.bloodbridge.bloodrequest.BloodRequest;
import com.bloodbridge.bloodrequest.BloodRequestRepository;
import com.bloodbridge.bloodrequest.donorresponse.DonorResponseRepository;
import com.bloodbridge.bloodrequest.dto.BloodRequestCreateDTO;
import com.bloodbridge.bloodrequest.dto.BloodRequestUpdateDTO;
import com.bloodbridge.bloodrequest.dto.DonorRespondRequest;
import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.RequestStatus;
import com.bloodbridge.common.Role;
import com.bloodbridge.common.Urgency;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donation.DonationRepository;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
import com.bloodbridge.hospital.Hospital;
import com.bloodbridge.hospital.HospitalRepository;
import com.bloodbridge.notification.NotificationRepository;
import com.bloodbridge.patient.PatientProfile;
import com.bloodbridge.patient.PatientProfileRepository;
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
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DonationAndResponseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorProfileRepository donorProfileRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private BloodRequestRepository bloodRequestRepository;

    @Autowired
    private DonorResponseRepository donorResponseRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private com.bloodbridge.inventory.BloodInventoryRepository inventoryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

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
        hospitalRepository.deleteAll();
        patientProfileRepository.deleteAll();
        donorProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createUser(String name, String email, Role role, String phone) {
        User user = new User();
        user.setFullName(name);
        user.setEmail(email.toLowerCase());
        user.setPasswordHash(passwordEncoder.encode("Password123!"));
        user.setRole(role);
        user.setPhoneNumber(phone);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private String getToken(User user) {
        return jwtTokenProvider.generateToken(UserPrincipal.create(user));
    }

    private DonorProfile createDonorProfile(User user, BloodGroup bloodGroup, VerificationStatus status, boolean available) {
        DonorProfile profile = new DonorProfile();
        profile.setUser(user);
        profile.setBloodGroup(bloodGroup);
        profile.setVerificationStatus(status);
        profile.setAvailableToDonate(available);
        profile.setCity("Metropolis");
        profile.setState("NY");
        profile.setAddress("123 Donor Way");
        profile.setDateOfBirth(LocalDate.of(1995, 5, 20));
        return donorProfileRepository.save(profile);
    }

    private PatientProfile createPatientProfile(User user) {
        PatientProfile profile = new PatientProfile();
        profile.setUser(user);
        profile.setCity("Metropolis");
        profile.setState("NY");
        profile.setAddress("456 Patient Lane");
        return patientProfileRepository.save(profile);
    }

    private Hospital createHospital(User user, String name, String regNo) {
        Hospital hospital = new Hospital();
        hospital.setUser(user);
        hospital.setHospitalName(name);
        hospital.setRegistrationNumber(regNo);
        hospital.setCity("Metropolis");
        hospital.setState("NY");
        hospital.setAddress("789 Hospital Plaza");
        hospital.setVerificationStatus(VerificationStatus.VERIFIED);
        return hospitalRepository.save(hospital);
    }

    @Test
    @DisplayName("Donation history returns empty page with 0 elements when donor has not donated yet")
    void testDonationHistoryEmptyForNewDonor() throws Exception {
        User donorUser = createUser("Alice Donor", "alice@example.com", Role.DONOR, "+1-555-1111");
        createDonorProfile(donorUser, BloodGroup.O_POSITIVE, VerificationStatus.VERIFIED, true);
        String donorToken = getToken(donorUser);

        mockMvc.perform(get("/api/donors/me/donations")
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements", is(0)));
    }

    @Test
    @DisplayName("Donor accepts emergency request, patient and hospital receive notifications, and patient can view contact")
    void testDonorAcceptEmergencyRequestAndPatientReceivesDetails() throws Exception {
        User patientUser = createUser("John Patient", "patient@example.com", Role.PATIENT, "+1-555-2222");
        createPatientProfile(patientUser);
        String patientToken = getToken(patientUser);

        User hospUser = createUser("City Hospital", "hospital@example.com", Role.HOSPITAL, "+1-555-3333");
        Hospital hospital = createHospital(hospUser, "Metropolis General Hospital", "REG-HOSP-001");
        String hospToken = getToken(hospUser);

        User donorUser = createUser("Bob Donor", "bob@example.com", Role.DONOR, "+1-555-4444");
        createDonorProfile(donorUser, BloodGroup.A_POSITIVE, VerificationStatus.VERIFIED, true);
        String donorToken = getToken(donorUser);

        // 1. Patient creates request for A+ (2 units)
        BloodRequestCreateDTO createDto = new BloodRequestCreateDTO(
                BloodGroup.A_POSITIVE,
                2,
                Urgency.CRITICAL,
                LocalDate.now().plusDays(2),
                hospital.getId(),
                "Critical trauma unit emergency"
        );

        String responseBody = mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long requestId = objectMapper.readTree(responseBody).get("id").asLong();

        // 2. Donor accepts request
        DonorRespondRequest respondDto = new DonorRespondRequest("ACCEPT", "Available to donate immediately at blood bank");

        mockMvc.perform(post("/api/blood-requests/" + requestId + "/respond")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(respondDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")))
                .andExpect(jsonPath("$.donorName", is("Bob Donor")))
                .andExpect(jsonPath("$.donorPhone", is("+1-555-4444")));

        // 3. Patient views donor responses and gets authorized contact details
        mockMvc.perform(get("/api/blood-requests/" + requestId + "/responses")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].donorName", is("Bob Donor")))
                .andExpect(jsonPath("$[0].donorBloodGroup", is("A+")))
                .andExpect(jsonPath("$[0].donorPhone", is("+1-555-4444")));

        // 4. Hospital also views responses
        mockMvc.perform(get("/api/blood-requests/" + requestId + "/responses")
                        .header("Authorization", "Bearer " + hospToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("Prevent duplicate response from same donor on the same request")
    void testPreventDuplicateDonorResponse() throws Exception {
        User patientUser = createUser("Jane Patient", "jane@example.com", Role.PATIENT, "+1-555-2222");
        createPatientProfile(patientUser);
        String patientToken = getToken(patientUser);

        User donorUser = createUser("Charlie Donor", "charlie@example.com", Role.DONOR, "+1-555-5555");
        createDonorProfile(donorUser, BloodGroup.O_NEGATIVE, VerificationStatus.VERIFIED, true);
        String donorToken = getToken(donorUser);

        BloodRequestCreateDTO createDto = new BloodRequestCreateDTO(
                BloodGroup.O_POSITIVE,
                1,
                Urgency.NORMAL,
                LocalDate.now().plusDays(3),
                null,
                "Surgery"
        );

        String res = mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long requestId = objectMapper.readTree(res).get("id").asLong();

        // First accept passes
        mockMvc.perform(post("/api/blood-requests/" + requestId + "/respond")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DonorRespondRequest("ACCEPT", null))))
                .andExpect(status().isOk());

        // Second accept fails with 409 Conflict
        mockMvc.perform(post("/api/blood-requests/" + requestId + "/respond")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DonorRespondRequest("ACCEPT", null))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Incompatible donor cannot accept blood request (clinical compatibility rule)")
    void testPreventIncompatibleDonorAcceptance() throws Exception {
        User patientUser = createUser("Pat Patient", "pat@example.com", Role.PATIENT, "+1-555-2222");
        createPatientProfile(patientUser);
        String patientToken = getToken(patientUser);

        // Patient needs O- (can ONLY receive from O-)
        BloodRequestCreateDTO createDto = new BloodRequestCreateDTO(
                BloodGroup.O_NEGATIVE,
                1,
                Urgency.CRITICAL,
                LocalDate.now().plusDays(1),
                null,
                "Rare O- emergency"
        );
        String res = mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long requestId = objectMapper.readTree(res).get("id").asLong();

        // Incompatible donor: A+ donor cannot donate to O- recipient!
        User donorUser = createUser("Dan Donor", "dan@example.com", Role.DONOR, "+1-555-6666");
        createDonorProfile(donorUser, BloodGroup.A_POSITIVE, VerificationStatus.VERIFIED, true);
        String donorToken = getToken(donorUser);

        mockMvc.perform(post("/api/blood-requests/" + requestId + "/respond")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DonorRespondRequest("ACCEPT", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Clinical incompatibility")));
    }

    @Test
    @DisplayName("Fulfill request records verified donation for accepted donor and updates last donation date")
    void testFulfillRequestRecordsVerifiedDonation() throws Exception {
        User patientUser = createUser("Sam Patient", "sam@example.com", Role.PATIENT, "+1-555-2222");
        createPatientProfile(patientUser);
        String patientToken = getToken(patientUser);

        User hospUser = createUser("St Jude Hospital", "stjude@example.com", Role.HOSPITAL, "+1-555-3333");
        Hospital hospital = createHospital(hospUser, "St Jude Clinic", "REG-HOSP-002");
        String hospToken = getToken(hospUser);

        User donorUser = createUser("Eve Donor", "eve@example.com", Role.DONOR, "+1-555-7777");
        DonorProfile donor = createDonorProfile(donorUser, BloodGroup.B_POSITIVE, VerificationStatus.VERIFIED, true);
        String donorToken = getToken(donorUser);

        // 1. Create request
        BloodRequestCreateDTO createDto = new BloodRequestCreateDTO(
                BloodGroup.B_POSITIVE,
                1,
                Urgency.NORMAL,
                LocalDate.now().plusDays(2),
                hospital.getId(),
                "Routine transfusion"
        );
        String res = mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long requestId = objectMapper.readTree(res).get("id").asLong();

        // 2. Donor accepts
        mockMvc.perform(post("/api/blood-requests/" + requestId + "/respond")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new DonorRespondRequest("ACCEPT", null))))
                .andExpect(status().isOk());

        // 3. Hospital approves and then fulfills request
        BloodRequestUpdateDTO approveDto = new BloodRequestUpdateDTO(null, null, null, null, RequestStatus.APPROVED);
        mockMvc.perform(put("/api/blood-requests/" + requestId)
                        .header("Authorization", "Bearer " + hospToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveDto)))
                .andExpect(status().isOk());

        BloodRequestUpdateDTO fulfillDto = new BloodRequestUpdateDTO(null, null, null, null, RequestStatus.FULFILLED);
        mockMvc.perform(put("/api/blood-requests/" + requestId)
                        .header("Authorization", "Bearer " + hospToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fulfillDto)))
                .andExpect(status().isOk());

        // 4. Verify donor can now see completed donation in history
        mockMvc.perform(get("/api/donors/me/donations")
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].bloodGroup", is("B+")))
                .andExpect(jsonPath("$.content[0].unitsDonated", is(1)))
                .andExpect(jsonPath("$.content[0].status", is("COMPLETED")))
                .andExpect(jsonPath("$.content[0].hospitalName", is("St Jude Clinic")));

        // 5. Verify donor profile's last donation date was updated
        DonorProfile updatedDonor = donorProfileRepository.findById(donor.getId()).orElseThrow();
        assertNotNull(updatedDonor.getLastDonationDate());
        assertEquals(LocalDate.now(), updatedDonor.getLastDonationDate());
    }

    @Test
    @DisplayName("Donation history is strictly isolated: Donor A cannot see Donor B's history")
    void testDonationHistoryIsolationBetweenDonors() throws Exception {
        User donorA = createUser("Donor A", "donora@example.com", Role.DONOR, "+1-555-8888");
        createDonorProfile(donorA, BloodGroup.O_POSITIVE, VerificationStatus.VERIFIED, true);
        String tokenA = getToken(donorA);

        User donorB = createUser("Donor B", "donorb@example.com", Role.DONOR, "+1-555-9999");
        createDonorProfile(donorB, BloodGroup.A_POSITIVE, VerificationStatus.VERIFIED, true);
        String tokenB = getToken(donorB);

        // A calls /api/donors/me/donations -> sees 0
        mockMvc.perform(get("/api/donors/me/donations")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(0)));

        // B calls /api/donors/me/donations -> sees 0
        mockMvc.perform(get("/api/donors/me/donations")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(0)));
    }
}
