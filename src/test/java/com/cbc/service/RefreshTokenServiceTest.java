package com.cbc.service;

import com.cbc.entity.RefreshToken;
import com.cbc.entity.User;
import com.cbc.exception.TokenRefreshException;
import com.cbc.exception.UserNotFoundException;
import com.cbc.repository.RefreshTokenRepository;
import com.cbc.repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepo userRepo;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshDurationMs", 10000L);
    }

    @Test
    void findByToken_ReturnsToken() {
        RefreshToken token = new RefreshToken();
        when(refreshTokenRepository.findByToken("token123")).thenReturn(Optional.of(token));

        Optional<RefreshToken> result = refreshTokenService.findByToken("token123");

        assertTrue(result.isPresent());
        assertEquals(token, result.get());
    }

    @Test
    void createRefreshToken_UserExists_CreatesAndReturnsToken() {
        User user = new User();
        user.setEmail("test@test.com");

        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByUser(user)).thenReturn(Optional.empty());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);

        RefreshToken result = refreshTokenService.createRefreshToken("test@test.com");

        assertNotNull(result);
        assertNotNull(result.getToken());
        assertEquals(user, result.getUser());
        verify(refreshTokenRepository).findByUser(user);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void createRefreshToken_UserNotFound_ThrowsException() {
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> refreshTokenService.createRefreshToken("test@test.com"));
    }

    @Test
    void verifyExpiration_NotExpired_ReturnsToken() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().plusMillis(10000));

        RefreshToken result = refreshTokenService.verifyExpiration(token);

        assertEquals(token, result);
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void verifyExpiration_Expired_ThrowsExceptionAndDelete() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(Instant.now().minusMillis(10000));

        assertThrows(TokenRefreshException.class, () -> refreshTokenService.verifyExpiration(token));
        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void deleteByUserId_UserExists_DeletesToken() {
        User user = new User();
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        refreshTokenService.deleteByUserId("test@test.com");

        verify(refreshTokenRepository).deleteByUser(user);
    }
}
