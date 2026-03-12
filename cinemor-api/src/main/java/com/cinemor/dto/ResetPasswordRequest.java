package com.cinemor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Token fehlt")
    private String token;

    @NotBlank(message = "Neues Passwort fehlt")
    @Size(min = 6, message = "Passwort muss mindestens 6 Zeichen haben")
    private String newPassword;
}
