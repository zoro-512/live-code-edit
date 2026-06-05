package com.cbc.repository;

import com.cbc.entity.RefreshToken;
import com.cbc.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Find a token record by its UUID string.
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Delete a refresh token associated with a specific User.
     * @Modifying is required because it changes (deletes) database records.
     */
    @Modifying
    void deleteByUser(User user);
}
