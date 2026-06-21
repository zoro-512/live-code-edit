package com.cbc.service;

import com.cbc.dto.auth.SignupReq;
import com.cbc.entity.Role;
import com.cbc.entity.User;
import com.cbc.repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private SignupReq validSignupReq;

    @BeforeEach
    void setUp() {
        validSignupReq = new SignupReq();
        validSignupReq.setName("Test User");
        validSignupReq.setEmail("test@domain.com");
        validSignupReq.setPassword("SecurePass123");
        validSignupReq.setRole(Role.USER);
    }

    @Test
    void saveNewUser_WithNewEmail_Returns200AndSuccessMessage() {

        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepo.save(any(User.class))).thenReturn(new User());


        ResponseEntity<String> response = authService.saveNewUser(validSignupReq);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User Registered Successfully", response.getBody());
        verify(userRepo, times(1)).save(any(User.class));
    }

    @Test
    void saveNewUser_WithExistingEmail_Returns400WithErrorMessage() {

        User existingUser = new User();
        existingUser.setEmail("test@domain.com");
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.of(existingUser));

        // When
        ResponseEntity<String> response = authService.saveNewUser(validSignupReq);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Email already registered", response.getBody());
        // Ensure no user was saved
        verify(userRepo, never()).save(any(User.class));
    }

    @Test
    void saveNewUser_ShouldEncodePasswordBeforeSaving() {

        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("SecurePass123")).thenReturn("$2a$10$hashedpassword");


        authService.saveNewUser(validSignupReq);


        verify(passwordEncoder, times(1)).encode("SecurePass123");
        verify(userRepo).save(argThat(user -> "$2a$10$hashedpassword".equals(user.getPassword())));
    }
}
