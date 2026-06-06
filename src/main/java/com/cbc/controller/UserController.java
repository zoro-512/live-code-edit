package com.cbc.controller;


import com.cbc.dto.UserResponse;
import com.cbc.dto.UserUpdateResponse;
import com.cbc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;


    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication){
        return ResponseEntity.ok(
                userService.getCurrentUser(authentication.getName())
        );
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(Authentication authentication, @RequestBody UserUpdateResponse userUpdateResponse){
        return  ResponseEntity.ok(
                userService.updateCurrentUser(authentication.getName(),userUpdateResponse)
        );
    }

}
