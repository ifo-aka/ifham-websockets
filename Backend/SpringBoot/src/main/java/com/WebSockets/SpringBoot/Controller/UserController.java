package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.DTOS.ContactDto;
import com.WebSockets.SpringBoot.DTOS.UserDto;
import com.WebSockets.SpringBoot.Entity.ContactEntity;
import com.WebSockets.SpringBoot.Models.APIResponse;
import com.WebSockets.SpringBoot.Models.AddContactModel;
import com.WebSockets.SpringBoot.Repository.AuthRepository;
import com.WebSockets.SpringBoot.Repository.ContactRepository;
import com.WebSockets.SpringBoot.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")

public class UserController {
    private final AuthRepository repository;
    private final UserService userService;
    private  final ContactRepository contactRepository;



    @GetMapping("/check-phone")
    public APIResponse<String> checkPhone(@RequestParam String phone) {
        boolean isAvailable=  repository.existsByPhoneNumber(phone);
        if(isAvailable)
          return  new APIResponse<>(true,"User Available","user exist");

       return new APIResponse<>(false,"no user found", "this number does not belongs to any user ");
    }





    // ✅ Add a new contact for a user
    @PostMapping("/{userId}/contacts")
    public APIResponse<ContactEntity> addContact(
            @PathVariable Long userId,
            @RequestBody AddContactModel contact) {
        System.out.println(contact+" "+userId);

        if(userService.existCheck(userId,contact)){
            return new APIResponse<>(true,"Phone number already saved",null);
        }

        ContactEntity saved = userService.addContact(userId, contact);
        return new APIResponse<>(true, "Contact saved successfully", saved);
    }

    // ✅ Get all contacts for a user
    @GetMapping("/{userId}/contacts")
    public APIResponse<List<ContactDto>> getContacts(@PathVariable Long userId) {
        List<ContactEntity> contacts = userService.getContacts(userId);
        List<ContactDto> dtos = new java.util.ArrayList<>(List.of());
       contacts.forEach(ce-> dtos.add(new ContactDto(ce.getId(),ce.getSavedAs(),ce.getPhoneNumber(),"eloo",getUrl(ce.getPhoneNumber()))));

        return new APIResponse<>(true, "Contacts fetched successfully", dtos);
    }
private  String getUrl(String number){
    return contactRepository.findProfilePictureUrlByPhoneNumber(number).orElse(null);
}
    // ✅ Remove a contact by ID
    @DeleteMapping("/contacts/{contactId}")
    public APIResponse<String> removeContact(@PathVariable Long contactId) {
        userService.removeContact(contactId);
        return new APIResponse<>(true, "Contact removed successfully", null);
    }

    // ✅ Update user profile with nickname and profile picture
    @PutMapping("/{userId}/profile")
    public APIResponse<UserDto> updateProfile(
            @PathVariable Long userId,
            @RequestParam("nickname") String nickname,
            @RequestParam("profilePicture") MultipartFile profilePicture) {
        try {
            UserDto updatedUser = userService.updateUserProfile(userId, nickname, profilePicture);
            return new APIResponse<>(true, "Profile updated successfully", updatedUser);
        } catch (IOException e) {
            // It's better to have more specific exception handling and logging
            return new APIResponse<>(false, "Failed to update profile due to a server error.", null);
        }
    }
}
