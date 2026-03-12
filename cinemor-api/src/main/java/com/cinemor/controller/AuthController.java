package com.cinemor.controller;

import com.cinemor.dto.AuthResponse;
import com.cinemor.dto.ForgotPasswordRequest;
import com.cinemor.dto.LoginRequest;
import com.cinemor.dto.RegisterRequest;
import com.cinemor.dto.ResetPasswordRequest;
import com.cinemor.dto.UserResponse;
import com.cinemor.entity.User;
import com.cinemor.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinemor.service.TokenStore;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final UserService userService;
    private final TokenStore tokenStore;

    public AuthController(UserService userService, TokenStore tokenStore) {
        this.userService = userService;
        this.tokenStore = tokenStore;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        UserResponse response = new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getEmail(), request.getPassword());
        UserResponse response = new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail()
        );
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, user.getId());
        return ResponseEntity.ok(new AuthResponse(token, response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
