package com.cbc.repository;

import com.cbc.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface UserRepo extends JpaRepository<User,Long> {

     Optional<User> findByEmail(String email);

     @Query("SELECT COUNT(u) > 0 FROM User u JOIN u.rooms r WHERE u.email = :email AND r.id = :roomId")
     boolean isUserMemberOfRoom(@Param("email") String email, @Param("roomId") Long roomId);
}
