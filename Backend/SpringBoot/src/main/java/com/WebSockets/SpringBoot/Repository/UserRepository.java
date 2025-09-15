package com.WebSockets.SpringBoot.Repository;

import com.WebSockets.SpringBoot.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity,Long> {

     Optional<UserEntity> findByUsername(String username);
}
