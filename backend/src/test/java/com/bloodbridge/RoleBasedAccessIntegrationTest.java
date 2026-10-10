package com.bloodbridge;

import com.bloodbridge.auth.dto.LoginRequest;
import com.bloodbridge.auth.dto.RegisterRequest;
import com.bloodbridge.common.Role;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RoleBasedAccessIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private com.bloodbridge.bloodrequest.BloodRequestRepository bloodRequestRepository;

    @Autowired
    private com.bloodbridge.inventory.BloodInventoryRepository inventoryRepository;

    @Autowired
    private com.bloodbridge.hospital.HospitalRepository hospitalRepository;

    @Autowired
    private com.bloodbridge.donor.DonorProfileRepository donorProfileRepository;

    @Autowired
    private com.bloodbridge.patient.PatientProfileRepository patientProfileRepository;

    @Autowired
    private com.bloodbridge.notification.NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        bloodRequestRepository.deleteAll();
        inventoryRepository.deleteAll();
        hospitalRepository.deleteAll();
        patientProfileRepository.deleteAll();
        donorProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String getPatientToken() throws Exception {
        RegisterRequest register = new RegisterRequest("Patient Person", "patient.rbac@example.com", "Password123!", Role.PATIENT, "123");
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(register)));

        LoginRequest login = new LoginRequest("patient.rbac@example.com", "Password123!");
        MvcResult res = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(login))).andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    private String getDonorToken() throws Exception {
        RegisterRequest register = new RegisterRequest("Donor Person", "donor.rbac@example.com", "Password123!", Role.DONOR, "456");
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(register)));

        LoginRequest login = new LoginRequest("donor.rbac@example.com", "Password123!");
        MvcResult res = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(login))).andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    private String createAdminAndGetToken() {
        User admin = new User();
        admin.setFullName("Super Admin");
        admin.setEmail("admin.rbac@example.com");
        admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        User saved = userRepository.save(admin);

        UserPrincipal principal = UserPrincipal.create(saved);
        return jwtTokenProvider.generateToken(principal);
    }

    @Test
    @DisplayName("Patient cannot access ADMIN endpoints and receives 403")
    void testPatientCannotAccessAdminEndpoints() throws Exception {
        String patientToken = getPatientToken();

        mockMvc.perform(get("/api/admin/donors/pending")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/hospitals/pending")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Donor cannot access ADMIN endpoints and receives 403")
    void testDonorCannotAccessAdminEndpoints() throws Exception {
        String donorToken = getDonorToken();

        mockMvc.perform(get("/api/admin/donors/pending")
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Donor cannot access Patient-only endpoints and receives 403")
    void testDonorCannotAccessPatientEndpoints() throws Exception {
        String donorToken = getDonorToken();

        mockMvc.perform(get("/api/patients/me")
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Patient cannot access Donor-only endpoints and receives 403")
    void testPatientCannotAccessDonorEndpoints() throws Exception {
        String patientToken = getPatientToken();

        mockMvc.perform(get("/api/donors/me")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can access ADMIN endpoints successfully")
    void testAdminCanAccessAdminEndpoints() throws Exception {
        String adminToken = createAdminAndGetToken();

        mockMvc.perform(get("/api/admin/donors/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/hospitals/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CORS preflight request succeeds with appropriate headers")
    void testCorsPreflightBehavior() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization,Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000"))
                .andExpect(header().exists(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS));
    }
}
