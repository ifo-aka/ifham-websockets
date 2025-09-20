package com.WebSockets.SpringBoot.Services;

import com.WebSockets.SpringBoot.Entity.ContactEntity;
import com.WebSockets.SpringBoot.Entity.UserEntity;
import com.WebSockets.SpringBoot.Models.AddContactModel;
import com.WebSockets.SpringBoot.Repository.AuthRepository;
import com.WebSockets.SpringBoot.Repository.ContactRepository;
import com.WebSockets.SpringBoot.customException.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AuthRepository userRepository;
    private final ContactRepository contactRepository;

    // Add a contact for a user
    public ContactEntity addContact(Long userId, AddContactModel contact) {
        System.out.println(userId);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        ContactEntity contactEntity = new ContactEntity();
        contactEntity.setUser(user);
        contactEntity.setSavedAs(contact.getSavedAs());
        contactEntity.setPhoneNumber(contact.getPhoneNumber());
        return contactRepository.save(contactEntity);
    }
    public  boolean existCheck(Long id,AddContactModel model){
        UserEntity entity = userRepository.findById(id).orElseThrow(()-> new UsernameNotFoundException("no user found for id"));

        return contactRepository.existsByUserAndPhoneNumber(entity,model.getPhoneNumber());
    }

    // Get all contacts for a user
    public List<ContactEntity> getContacts(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return user.getContacts(); // thanks to @OneToMany
    }

    // Remove a contact
    public void removeContact(Long contactId) {
        contactRepository.deleteById(contactId);
    }

}
