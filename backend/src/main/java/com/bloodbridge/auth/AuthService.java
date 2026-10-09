package com.bloodbridge.auth;

import com.bloodbridge.auth.dto.AuthResponse;
import com.bloodbridge.auth.dto.LoginRequest;
import com.bloodbridge.auth.dto.RegisterRequest;
import com.bloodbridge.auth.dto.UserSummaryResponse;
import com.bloodbridge.common.Role;
import com.bloodbridge.donor.DonorProfile;
import com.bloodbridge.donor.DonorProfileRepository;
import com.bloodbridge.exception.BadRequestException;
import com.bloodbridge.exception.DuplicateResourceException;
import com.bloodbridge.exception.ResourceNotFoundException;
import com.bloodbridge.patient.PatientProfile;
import com.bloodbridge.patient.PatientProfileRepository;
import com.bloodbridge.security.JwtTokenProvider;
import com.bloodbridge.security.UserPrincipal;
import com.bloodbridge.user.User;
import com.bloodbridge.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       DonorProfileRepository donorProfileRepository,
                       PatientProfileRepository patientProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public UserSummaryResponse register(RegisterRequest request) {
        if (request.role() != Role.PATIENT && request.role() != Role.DONOR) {
            throw new BadRequestException("Can only register as PATIENT or DONOR");
        }

        String normalizedEmail = request.email().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setPhoneNumber(request.phoneNumber());
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        if (request.role() == Role.DONOR) {
            DonorProfile donorProfile = new DonorProfile();
            donorProfile.setUser(savedUser);
            donorProfile.setAvailableToDonate(true);
            donorProfileRepository.save(donorProfile);
        } else if (request.role() == Role.PATIENT) {
            PatientProfile patientProfile = new PatientProfile();
            patientProfile.setUser(savedUser);
            patientProfileRepository.save(patientProfile);
        }

        return new UserSummaryResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getPhoneNumber(),
                savedUser.getCreatedAt()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().toLowerCase(),
                        request.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = tokenProvider.generateToken(userPrincipal);

        return new AuthResponse(
                jwt,
                "Bearer",
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getRole()
        );
    }

    public UserSummaryResponse getCurrentUser(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getCreatedAt()
        );
    }
}
