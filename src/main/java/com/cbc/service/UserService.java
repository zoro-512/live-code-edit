package com.cbc.service;

import com.cbc.dto.user.UserResponse;
import com.cbc.dto.user.UserUpdateRequest;
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

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }


    public UserResponse updateCurrentUser(String email, UserUpdateRequest userUpdateRequest) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if(userUpdateRequest.password() != null &&
                !userUpdateRequest.password().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(userUpdateRequest.password())
            );
        }
        user.setName(userUpdateRequest.name());
        userRepo.save(user);

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
