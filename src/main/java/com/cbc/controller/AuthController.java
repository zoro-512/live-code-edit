package com.cbc.controller;

import com.cbc.dto.LoginReq;
import com.cbc.dto.SignupReq;
import com.cbc.service.UserDetailServiceImplementation;
import com.cbc.service.UserService;
import com.cbc.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController("/auth")
public class UserController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private UserDetailServiceImplementation userDetailsService;

    @PostMapping("/SignUp")
    public ResponseEntity<String> signup(@RequestBody SignupReq u){
        return userService.SaveNewUser(u);

    }

    @PostMapping("Login")
    public ResponseEntity<String> Login(@RequestBody LoginReq u){
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(u.getEmail(), u.getPassword()));
            UserDetails us = userDetailsService.loadUserByUsername(u.getEmail());
            String jwts = jwtUtils.generateToken(us.getUsername());
            return new ResponseEntity<>(jwts, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_ACCEPTABLE);
        }
    }
}
