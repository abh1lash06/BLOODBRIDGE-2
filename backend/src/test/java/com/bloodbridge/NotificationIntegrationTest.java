package com.bloodbridge;

import com.bloodbridge.bloodrequest.BloodRequestRepository;
import com.bloodbridge.bloodrequest.dto.BloodRequestCreateDTO;
import com.bloodbridge.common.BloodGroup;
import com.bloodbridge.common.NotificationType;
import com.bloodbridge.common.Role;
import com.bloodbridge.common.Urgency;
import com.bloodbridge.common.VerificationStatus;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
import com.bloodbridge.hospital.HospitalRepository;
import com.bloodbridge.notification.Notification;
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
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class NotificationIntegrationTest {

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
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        bloodRequestRepository.deleteAll();
        donorProfileRepository.deleteAll();
        patientProfileRepository.deleteAll();
        hospitalRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createUser(String name, String email, Role role) {
        User user = new User();
        user.setFullName(name);
        user.setEmail(email.toLowerCase());
        user.setPasswordHash(passwordEncoder.encode("Password123!"));
        user.setRole(role);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private String getToken(User user) {
        return jwtTokenProvider.generateToken(UserPrincipal.create(user));
    }

    private DonorProfile createDonor(String name, String email, BloodGroup bg, VerificationStatus status, boolean available) {
        User user = createUser(name, email, Role.DONOR);
        DonorProfile profile = new DonorProfile();
        profile.setUser(user);
        profile.setBloodGroup(bg);
        profile.setVerificationStatus(status);
        profile.setAvailableToDonate(available);
        return donorProfileRepository.save(profile);
    }

    @Test
    @DisplayName("Patient creates blood request: matching verified available donor receives notification, ineligible donors do not")
    void testMatchingDonorNotificationFlow() throws Exception {
        // 1. Setup Patient
        User patientUser = createUser("John Patient", "patient@test.com", Role.PATIENT);
        PatientProfile patientProfile = new PatientProfile();
        patientProfile.setUser(patientUser);
        patientProfileRepository.save(patientProfile);
        String patientToken = getToken(patientUser);

        // 2. Setup Donors:
        // Donor 1: MATCHING (O_POSITIVE, VERIFIED, available=true) -> SHOULD RECEIVE
        DonorProfile matchingDonor = createDonor("Eligible Donor", "eligible.donor@test.com",
                BloodGroup.O_POSITIVE, VerificationStatus.VERIFIED, true);
        String matchingDonorToken = getToken(matchingDonor.getUser());

        // Donor 2: UNAVAILABLE (O_POSITIVE, VERIFIED, available=false) -> SHOULD NOT RECEIVE
        DonorProfile unavailableDonor = createDonor("Unavailable Donor", "unavailable.donor@test.com",
                BloodGroup.O_POSITIVE, VerificationStatus.VERIFIED, false);

        // Donor 3: UNVERIFIED (O_POSITIVE, PENDING, available=true) -> SHOULD NOT RECEIVE
        DonorProfile unverifiedDonor = createDonor("Unverified Donor", "unverified.donor@test.com",
                BloodGroup.O_POSITIVE, VerificationStatus.PENDING, true);

        // Donor 4: DIFFERENT BLOOD GROUP (A_POSITIVE, VERIFIED, available=true) -> SHOULD NOT RECEIVE
        DonorProfile otherBloodDonor = createDonor("Other Blood Donor", "other.donor@test.com",
                BloodGroup.A_POSITIVE, VerificationStatus.VERIFIED, true);

        // 3. Patient creates Blood Request for O_POSITIVE
        BloodRequestCreateDTO dto = new BloodRequestCreateDTO(
                BloodGroup.O_POSITIVE,
                2,
                Urgency.URGENT,
                LocalDate.now().plusDays(3),
                null,
                "Need 2 units for surgery"
        );

        mockMvc.perform(post("/api/blood-requests")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        // 4. Verify Patient received confirmation notification
        List<Notification> patientNotifs = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient().getId().equals(patientUser.getId()))
                .toList();
        assertEquals(1, patientNotifs.size(), "Patient must receive confirmation notification");
        assertEquals(NotificationType.BLOOD_REQUEST_CREATED, patientNotifs.get(0).getNotificationType());
        assertTrue(patientNotifs.get(0).getMessage().contains("O+"));

        // 5. Verify Eligible Donor received notification
        List<Notification> eligibleDonorNotifs = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient().getId().equals(matchingDonor.getUser().getId()))
                .toList();
        assertEquals(1, eligibleDonorNotifs.size(), "Matching verified available donor must receive notification");
        assertEquals("Matching Blood Request", eligibleDonorNotifs.get(0).getTitle());
        assertEquals(NotificationType.BLOOD_REQUEST_CREATED, eligibleDonorNotifs.get(0).getNotificationType());

        // 6. Verify Ineligible Donors received NO notifications
        long unavailableCount = notificationRepository.countByRecipientIdAndReadStatus(unavailableDonor.getUser().getId(), false);
        assertEquals(0, unavailableCount, "Unavailable donor must NOT receive notification");

        long unverifiedCount = notificationRepository.countByRecipientIdAndReadStatus(unverifiedDonor.getUser().getId(), false);
        assertEquals(0, unverifiedCount, "Unverified donor must NOT receive notification");

        long otherBloodCount = notificationRepository.countByRecipientIdAndReadStatus(otherBloodDonor.getUser().getId(), false);
        assertEquals(0, otherBloodCount, "Non-matching blood group donor must NOT receive notification");

        // 7. Verify Eligible Donor retrieves notification via API
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + matchingDonorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title", is("Matching Blood Request")))
                .andExpect(jsonPath("$.content[0].readStatus", is(false)));

        // 8. Verify unread count via API
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + matchingDonorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", is(1)));

        // 9. Donor marks notification as read
        Long notifId = eligibleDonorNotifs.get(0).getId();
        mockMvc.perform(patch("/api/notifications/" + notifId + "/read")
                        .header("Authorization", "Bearer " + matchingDonorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.readStatus", is(true)));

        // 10. Verify unread count is now 0
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + matchingDonorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", is(0)));
    }

    @Test
    @DisplayName("User cannot access or mark read another user's notification")
    void testNotificationAccessControl() throws Exception {
        User user1 = createUser("User One", "user1@test.com", Role.DONOR);
        User user2 = createUser("User Two", "user2@test.com", Role.DONOR);
        String token1 = getToken(user1);
        String token2 = getToken(user2);

        // Create notification for user1
        Notification n = new Notification();
        n.setRecipient(user1);
        n.setTitle("Private Alert");
        n.setMessage("For user 1 eyes only");
        n.setNotificationType(NotificationType.GENERAL);
        n.setReadStatus(false);
        Notification saved = notificationRepository.save(n);

        // User2 tries to mark User1's notification as read -> 403 Forbidden
        mockMvc.perform(patch("/api/notifications/" + saved.getId() + "/read")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden());

        // User2 viewing their own notifications sees empty list
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    @Test
    @DisplayName("Mark all as read updates all notifications for the authenticated user")
    void testMarkAllAsRead() throws Exception {
        User user = createUser("Alert User", "alert@test.com", Role.DONOR);
        String token = getToken(user);

        for (int i = 1; i <= 3; i++) {
            Notification n = new Notification();
            n.setRecipient(user);
            n.setTitle("Notice " + i);
            n.setMessage("Message " + i);
            n.setNotificationType(NotificationType.GENERAL);
            n.setReadStatus(false);
            notificationRepository.save(n);
        }

        // Check initial unread count
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", is(3)));

        // Mark all as read
        mockMvc.perform(patch("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Check unread count is 0
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", is(0)));
    }
}
