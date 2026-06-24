package com.cbc.service;

import com.cbc.entity.RefreshToken;
import com.cbc.exception.TokenRefreshException;
import com.cbc.exception.UserNotFoundException;
import com.cbc.repository.RefreshTokenRepository;
import com.cbc.repository.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refresh-expiration}")
    private Long refreshDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepo userRepo;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepo userRepo) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepo = userRepo;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }


    @Transactional
    public RefreshToken createRefreshToken(String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElse(new RefreshToken());

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString()); // Generates a secure random UUID

        return refreshTokenRepository.save(refreshToken);
    }


    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token has expired. Please log in again.");
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        refreshTokenRepository.deleteByUser(user);
    }
}
