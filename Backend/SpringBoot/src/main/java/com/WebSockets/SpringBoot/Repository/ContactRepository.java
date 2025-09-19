package com.WebSockets.SpringBoot.Repository;

import com.WebSockets.SpringBoot.Entity.ContactEntity;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ContactRepository extends JpaRepository<ContactEntity,Long> {

}
