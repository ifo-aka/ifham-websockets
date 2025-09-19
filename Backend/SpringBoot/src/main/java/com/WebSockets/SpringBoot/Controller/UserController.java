package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.Entity.ContactEntity;
import com.WebSockets.SpringBoot.Models.APIResponse;
import com.WebSockets.SpringBoot.Models.AddContactModel;
import com.WebSockets.SpringBoot.Repository.AuthRepository;
import com.WebSockets.SpringBoot.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")

public class UserController {
    private final AuthRepository repository;
    private final UserService userService;



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

        ContactEntity saved = userService.addContact(userId, contact);
        return new APIResponse<>(true, "Contact saved successfully", saved);
    }

    // ✅ Get all contacts for a user
    @GetMapping("/{userId}/contacts")
    public APIResponse<List<ContactEntity>> getContacts(@PathVariable Long userId) {
        List<ContactEntity> contacts = userService.getContacts(userId);
        return new APIResponse<>(true, "Contacts fetched successfully", contacts);
    }

    // ✅ Remove a contact by ID
    @DeleteMapping("/contacts/{contactId}")
    public APIResponse<String> removeContact(@PathVariable Long contactId) {
        userService.removeContact(contactId);
        return new APIResponse<>(true, "Contact removed successfully", null);
    }
}
