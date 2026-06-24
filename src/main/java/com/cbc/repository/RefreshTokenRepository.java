package com.cbc.repository;

import com.cbc.entity.RefreshToken;
import com.cbc.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {


    Optional<RefreshToken> findByToken(String token);


    Optional<RefreshToken> findByUser(User user);

    void deleteByUser(User user);
}
