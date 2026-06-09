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


    public ResponseEntity<String> SaveNewUser(SignupReq u) {
        if(userRepo.findByEmail(u.getEmail()).isPresent())
            return new ResponseEntity<>( HttpStatus.BAD_REQUEST);
        User a=new User();
        a.setPassword(passwordEncoder.encode(u.getPassword()));
        a.setName(u.getName());
        a.setEmail(u.getEmail());
        a.setCreatedAt(LocalDateTime.now());
        a.setRole(Role.USER);
        userRepo.save(a);
        return new  ResponseEntity<>("User Registered Successfully",HttpStatusCode.valueOf(200));
    }


}
