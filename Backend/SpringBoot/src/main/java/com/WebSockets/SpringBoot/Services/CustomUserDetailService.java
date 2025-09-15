package com.WebSockets.SpringBoot.Services;

import com.WebSockets.SpringBoot.Entity.UserEntity;
import com.WebSockets.SpringBoot.Repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailService implements UserDetailsService {
    UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException("No User exist with this email"));

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("user")
                .build();
    }
}
