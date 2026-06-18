package com.cbc.service;

import com.cbc.dto.auth.SignupReq;
import com.cbc.entity.Role;
import com.cbc.entity.User;
import com.cbc.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {


    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;


    public ResponseEntity<String> saveNewUser(SignupReq u) {
        if(userRepo.findByEmail(u.email()).isPresent())
            return new ResponseEntity<>( HttpStatus.BAD_REQUEST);
        User user = new User();
        user.setPassword(passwordEncoder.encode(u.password()));
        user.setName(u.name());
        user.setEmail(u.email());
        user.setCreatedAt(LocalDateTime.now());
        user.setRole(Role.USER);
        userRepo.save(user);
        return new  ResponseEntity<>("User Registered Successfully", HttpStatusCode.valueOf(200));
    }


}
