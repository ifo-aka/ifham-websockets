package com.WebSockets.SpringBoot.Repository;

import com.WebSockets.SpringBoot.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthRepository extends JpaRepository<UserEntity,Long> {
     boolean existsByPhoneNumber(String phoneNo);
     Optional<UserEntity> findByUsername(String username);
     Optional<UserEntity> findByPhoneNumber(String phoneNumber);

}
