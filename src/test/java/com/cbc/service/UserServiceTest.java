package com.cbc.service;

import com.cbc.dto.user.UserResponse;
import com.cbc.dto.user.UserUpdateRequest;
import com.cbc.entity.Role;
import com.cbc.entity.User;
import com.cbc.exception.UserNotFoundException;
import com.cbc.repository.UserRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void getCurrentUser_UserExists_ReturnsUserResponse() {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@test.com");
        user.setRole(Role.USER);

        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        UserResponse response = userService.getCurrentUser("test@test.com");

        assertEquals(1L, response.id());
        assertEquals("Test User", response.name());
        assertEquals("test@test.com", response.email());
        assertEquals(Role.USER, response.role());
    }

    @Test
    void getCurrentUser_UserNotFound_ThrowsException() {
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getCurrentUser("test@test.com"));
    }

    @Test
    void updateCurrentUser_ValidRequest_UpdatesUser() {
        User user = new User();
        user.setId(1L);
        user.setName("Old Name");
        user.setEmail("test@test.com");
        user.setRole(Role.USER);

        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
        when(userRepo.save(any(User.class))).thenReturn(user);

        UserUpdateRequest request = new UserUpdateRequest("New Name", "newPassword");
        UserResponse response = userService.updateCurrentUser("test@test.com", request);

        assertEquals("New Name", response.name());
        verify(passwordEncoder, times(1)).encode("newPassword");
        verify(userRepo, times(1)).save(user);
    }
}
