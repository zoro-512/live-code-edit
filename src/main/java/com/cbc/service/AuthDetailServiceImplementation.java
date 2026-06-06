package com.cbc.service;

import com.cbc.entity.User;
import com.cbc.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthDetailServiceImplementation implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> u = userRepo.findByEmail(email);
        if (u.isEmpty()) {
            throw new UsernameNotFoundException("email not found");
        }
        User ur = u.get();
        return org.springframework.security.core.userdetails.User.builder()
                .username(ur.getEmail())
                .password(ur.getPassword())
                .authorities("User")
                .build();
    }
}
