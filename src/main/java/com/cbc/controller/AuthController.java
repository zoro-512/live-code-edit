package com.cbc.controller;

import com.cbc.dto.auth.JwtResponse;
import com.cbc.dto.auth.LoginReq;
import com.cbc.dto.auth.SignupReq;
import com.cbc.dto.auth.TokenRefreshRequest;
import com.cbc.entity.RefreshToken;
import com.cbc.exception.TokenRefreshException;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
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


    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupReq u){
        return authService.saveNewUser(u);

    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginReq u){
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(u.email(), u.password()));
            UserDetails us = userDetailsService.loadUserByUsername(u.email());
            String jwts = jwtUtils.generateToken(us.getUsername());
            return new ResponseEntity<>(jwts, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_ACCEPTABLE);
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken();
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateToken(user.getEmail());
                    return ResponseEntity.ok(new JwtResponse(token, requestRefreshToken, user.getEmail()));
                })
                .orElseThrow(() -> new TokenRefreshException("Refresh token is not in database!"));
    }
}
