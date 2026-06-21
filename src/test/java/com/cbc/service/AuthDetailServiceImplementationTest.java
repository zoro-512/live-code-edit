package com.cbc.service;

import com.cbc.entity.User;
import com.cbc.repository.UserRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthDetailServiceImplementationTest {

    @Mock
    private UserRepo userRepo;

    @InjectMocks
    private AuthDetailServiceImplementation authDetailService;

    @Test
    void loadUserByUsername_UserExists_ReturnsUserDetails() {
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("hashedpass");

        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = authDetailService.loadUserByUsername("test@test.com");

        assertNotNull(userDetails);
        assertEquals("test@test.com", userDetails.getUsername());
        assertEquals("hashedpass", userDetails.getPassword());
    }

    @Test
    void loadUserByUsername_UserNotFound_ThrowsException() {
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> authDetailService.loadUserByUsername("test@test.com"));
    }
}
