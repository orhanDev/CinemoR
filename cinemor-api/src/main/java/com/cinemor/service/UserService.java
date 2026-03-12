package com.cinemor.service;

import com.cinemor.dto.RegisterRequest;
import com.cinemor.entity.User;
import com.cinemor.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private static final int RESET_TOKEN_VALID_HOURS = 1;

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final String frontendUrl;
    private final boolean mailEnabled;

    public UserService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${app.mail-enabled:false}") boolean mailEnabled) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
        this.mailEnabled = mailEnabled;
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-Mail ist bereits registriert");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    public User authenticate(String email, String rawPassword) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty() || !passwordEncoder.matches(rawPassword, user.get().getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-Mail oder Passwort ist falsch");
        }
        return user.get();
    }

    public void forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Diese E-Mail-Adresse ist nicht registriert.");
        }
        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(RESET_TOKEN_VALID_HOURS));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        if (mailEnabled) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(email);
                helper.setSubject("CinemoR – Passwort zurücksetzen");
                helper.setText(
                    "Hallo,\n\n" +
                    "Sie haben die Zurücksetzung Ihres Passworts angefordert.\n\n" +
                    "Klicken Sie auf den folgenden Link, um ein neues Passwort zu setzen (der Link ist 1 Stunde gültig):\n\n" +
                    resetLink + "\n\n" +
                    "Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.\n\n" +
                    "Mit freundlichen Grüßen,\nIhr CinemoR-Team",
                    false
                );
                mailSender.send(message);
                log.info("Passwort-Reset-E-Mail an {} gesendet.", email);
            } catch (MessagingException e) {
                log.error("E-Mail konnte nicht gesendet werden (Passwort-Reset an {}): {}", email, e.getMessage());
                logResetLinkFallback(email, resetLink);
            } catch (Exception e) {
                log.error("E-Mail-Versand fehlgeschlagen (Passwort-Reset an {}): {}", email, e.getMessage());
                logResetLinkFallback(email, resetLink);
            }
        } else {
            logResetLinkFallback(email, resetLink);
        }
    }

    private void logResetLinkFallback(String email, String resetLink) {
        log.warn("E-Mail-Versand deaktiviert oder fehlgeschlagen. Reset-Link für {} (1h gültig): {}", email, resetLink);
    }

    public void resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ungültiger oder abgelaufener Link. Bitte Passwort erneut anfordern.");
        }
        User user = userOpt.get();
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link abgelaufen. Bitte Passwort erneut anfordern.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}
