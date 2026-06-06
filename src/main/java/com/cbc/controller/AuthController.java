package com.cbc.controller;

import com.cbc.dto.JwtResponse;
import com.cbc.dto.LoginReq;
import com.cbc.dto.SignupReq;
import com.cbc.dto.TokenRefreshRequest;
import com.cbc.entity.RefreshToken;
import com.cbc.service.AuthDetailServiceImplementation;
import com.cbc.service.AuthService;
import com.cbc.service.RefreshTokenService;
import com.cbc.utils.JwtUtils;
import jakarta.validation.Valid;
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
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private AuthService authService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private AuthDetailServiceImplementation userDetailsService;
    @Autowired
    private  RefreshTokenService refreshTokenService;


    @PostMapping("/SignUp")
    public ResponseEntity<String> signup(@RequestBody SignupReq u){
        return authService.SaveNewUser(u);

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

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateToken(user.getEmail());
                    return ResponseEntity.ok(new JwtResponse(token, requestRefreshToken, user.getEmail()));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
}
