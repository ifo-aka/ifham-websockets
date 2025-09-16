package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.Models.APIResponse;
import com.WebSockets.SpringBoot.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class OtherController {
    private final UserRepository repository;



    @GetMapping("/check-phone")
    public APIResponse<String> checkPhone(@RequestParam String phone) {
        boolean isAvailable=  repository.existByPhoneNumber(phone);
        if(isAvailable)
          return  new APIResponse<>(true,"User Available","user exist");

       return new APIResponse<>(true,"no user found", "this number does not belongs to any user ");
    }
}
