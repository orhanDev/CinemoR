package com.cinemor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void register_returnsCreatedAndUserData() throws Exception {
        String email = "test-" + System.currentTimeMillis() + "@example.com";
        String body = objectMapper.writeValueAsString(
            new RegisterDto("Test", "User", email, "SecurePass1!")
        );

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.firstName").value("Test"))
            .andExpect(jsonPath("$.lastName").value("User"))
            .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        String email = "wrong-" + System.currentTimeMillis() + "@example.com";
        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new RegisterDto("Wrong", "User", email, "SecurePass1!"))))
            .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(new LoginDto(email, "WrongPassword"));
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        String email = "dup-" + System.currentTimeMillis() + "@example.com";
        String body = objectMapper.writeValueAsString(
            new RegisterDto("First", "User", email, "SecurePass1!"));

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isConflict());
    }

    @Test
    void login_afterRegister_returnsTokenAndUser() throws Exception {
        String email = "login-" + System.currentTimeMillis() + "@example.com";
        String password = "SecurePass1!";

        String registerBody = objectMapper.writeValueAsString(
            new RegisterDto("Login", "Test", email, password));
        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody))
            .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(new LoginDto(email, password));
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.user.email").value(email));
    }

    private static class RegisterDto {
        public String firstName;
        public String lastName;
        public String email;
        public String password;

        RegisterDto(String firstName, String lastName, String email, String password) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.password = password;
        }
    }

    private static class LoginDto {
        public String email;
        public String password;

        LoginDto(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }
}
