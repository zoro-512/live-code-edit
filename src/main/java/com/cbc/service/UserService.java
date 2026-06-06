package com.cbc.service;

import com.cbc.dto.UserResponse;
import com.cbc.dto.UserUpdateResponse;
import com.cbc.entity.User;
import com.cbc.exception.UserNotFoundException;
import com.cbc.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        UserResponse response = new UserResponse();
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setId(user.getId());
        return response;
    }


    public UserResponse updateCurrentUser(String email, UserUpdateResponse userUpdateResponse) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if(userUpdateResponse.getPassword() != null &&
                !userUpdateResponse.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(userUpdateResponse.getPassword())
            );
        }
        user.setName(userUpdateResponse.getName());
            userRepo.save(user);
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        return response;
    }
}
