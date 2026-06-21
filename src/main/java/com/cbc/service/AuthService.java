package com.cbc.service;

import com.cbc.dto.auth.SignupReq;
import com.cbc.entity.Role;
import com.cbc.entity.User;
import com.cbc.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;


    public ResponseEntity<String> saveNewUser(SignupReq u) {
        if (userRepo.findByEmail(u.getEmail()).isPresent())
            return new ResponseEntity<>("Email already registered", HttpStatus.BAD_REQUEST);
        User user = new User();
        user.setPassword(passwordEncoder.encode(u.getPassword()));
        user.setName(u.getName());
        user.setEmail(u.getEmail());
        user.setCreatedAt(LocalDateTime.now());
        user.setRole(Role.USER);
        userRepo.save(user);
        return new ResponseEntity<>("User Registered Successfully", HttpStatus.OK);
    }


}
