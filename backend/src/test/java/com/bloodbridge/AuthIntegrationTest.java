package com.bloodbridge;

import com.bloodbridge.auth.dto.LoginRequest;
import com.bloodbridge.auth.dto.RegisterRequest;
import com.bloodbridge.common.Role;
import com.bloodbridge.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.bloodbridge.donor.DonorProfileRepository donorProfileRepository;

    @Autowired
    private com.bloodbridge.patient.PatientProfileRepository patientProfileRepository;

    @Autowired
    private com.bloodbridge.notification.NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        patientProfileRepository.deleteAll();
        donorProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully register a patient")
    void testSuccessfulPatientRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "John Patient",
                "john.patient@example.com",
                "Password123!",
                Role.PATIENT,
                "1234567890"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.fullName", is("John Patient")))
                .andExpect(jsonPath("$.email", is("john.patient@example.com")))
                .andExpect(jsonPath("$.role", is("PATIENT")));
    }

    @Test
    @DisplayName("Should successfully register a donor")
    void testSuccessfulDonorRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Jane Donor",
                "jane.donor@example.com",
                "Password123!",
                Role.DONOR,
                "9876543210"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.fullName", is("Jane Donor")))
                .andExpect(jsonPath("$.email", is("jane.donor@example.com")))
                .andExpect(jsonPath("$.role", is("DONOR")));
    }

    @Test
    @DisplayName("Should reject duplicate email registration with 409 Conflict")
    void testDuplicateEmailRejection() throws Exception {
        RegisterRequest first = new RegisterRequest(
                "Alice First",
                "alice@example.com",
                "Password123!",
                Role.PATIENT,
                "1112223333"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        RegisterRequest duplicate = new RegisterRequest(
                "Alice Second",
                "ALICE@example.com",
                "AnotherPassword123!",
                Role.DONOR,
                "4445556666"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("DUPLICATE_RESOURCE")));
    }

    @Test
    @DisplayName("Should reject public ADMIN registration with 400 Bad Request")
    void testPublicAdminRegistrationRejection() throws Exception {
        RegisterRequest adminRequest = new RegisterRequest(
                "Malicious Admin",
                "hacker@example.com",
                "Password123!",
                Role.ADMIN,
                "9998887777"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")));
    }

    @Test
    @DisplayName("Should reject public HOSPITAL registration with 400 Bad Request")
    void testPublicHospitalRegistrationRejection() throws Exception {
        RegisterRequest hospitalRequest = new RegisterRequest(
                "Fake Hospital",
                "fake.hospital@example.com",
                "Password123!",
                Role.HOSPITAL,
                "9998887777"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hospitalRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")));
    }

    @Test
    @DisplayName("Should successfully login and return signed JWT")
    void testSuccessfulLogin() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Login User",
                "login.user@example.com",
                "SecretPass123!",
                Role.PATIENT,
                "5556667777"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest("login.user@example.com", "SecretPass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.email", is("login.user@example.com")))
                .andExpect(jsonPath("$.role", is("PATIENT")));
    }

    @Test
    @DisplayName("Should reject invalid credentials with 401 Unauthorized")
    void testInvalidCredentialsRejection() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Valid User",
                "valid.user@example.com",
                "CorrectPassword123!",
                Role.DONOR,
                "5551112222"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest wrongPassword = new LoginRequest("valid.user@example.com", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPassword)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("AUTHENTICATION_FAILED")));
    }

    @Test
    @DisplayName("Should access /api/auth/me with valid JWT and reject without JWT")
    void testJwtProtectedEndpoints() throws Exception {
        // Without JWT -> 401
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        // Register and login to obtain JWT
        RegisterRequest registerRequest = new RegisterRequest(
                "Me User",
                "me.user@example.com",
                "Password123!",
                Role.DONOR,
                "5559990000"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest("me.user@example.com", "Password123!");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        // With JWT -> 200
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("me.user@example.com")))
                .andExpect(jsonPath("$.fullName", is("Me User")))
                .andExpect(jsonPath("$.role", is("DONOR")));
    }
}
