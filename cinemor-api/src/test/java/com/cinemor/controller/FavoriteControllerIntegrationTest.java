package com.cinemor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class FavoriteControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void getFavoriteIds_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/favorites/auth/ids"))
            .andExpect(status().isForbidden());
    }

    @Test
    void getFavoriteIds_withValidToken_returns200AndArray() throws Exception {
        String email = "fav-" + System.currentTimeMillis() + "@example.com";
        String password = "SecurePass1!";

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new RegisterDto("Fav", "User", email, password))))
            .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(new LoginDto(email, password));
        String loginResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String token = objectMapper.readTree(loginResponse).get("token").asText();

        mockMvc.perform(get("/api/favorites/auth/ids")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray());
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
