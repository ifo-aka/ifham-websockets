package com.WebSockets.SpringBoot.Services;

import com.WebSockets.SpringBoot.DTOS.UserDto;
import com.WebSockets.SpringBoot.Entity.ContactEntity;
import com.WebSockets.SpringBoot.Entity.UserEntity;
import com.WebSockets.SpringBoot.Models.AddContactModel;
import com.WebSockets.SpringBoot.Repository.AuthRepository;
import com.WebSockets.SpringBoot.Repository.ContactRepository;
import com.WebSockets.SpringBoot.customException.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AuthRepository userRepository;
    private final ContactRepository contactRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

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

    public UserDto updateUserProfile(Long userId, String nickname, MultipartFile profilePicture) throws IOException {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Save the profile picture
        String profilePictureUrl = null;
        if (profilePicture != null && !profilePicture.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Create a unique file name to avoid collisions
            String fileName = userId + "_" + System.currentTimeMillis() + "_" + profilePicture.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(profilePicture.getInputStream(), filePath);
            
            // This URL path assumes you have configured static resource handling
            // to serve files from the 'photos' directory.
            profilePictureUrl = "/photos/" + fileName; 
        }

        // Update user details
        user.setNickname(nickname);
        if (profilePictureUrl != null) {
            user.setProfilePictureUrl(profilePictureUrl);
        }

        UserEntity updatedUser = userRepository.save(user);

        // Return DTO with updated info
        return new UserDto(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getPhoneNumber(),
                null, // Token is not sent back on profile update
                updatedUser.getNickname(),
                updatedUser.getProfilePictureUrl()
        );
    }

}
