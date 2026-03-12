package com.cinemor.config;

import jakarta.mail.Session;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;

import java.io.InputStream;
import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnMissingBean(JavaMailSender.class)
    public JavaMailSender noOpMailSender() {
        return new NoOpJavaMailSender();
    }

    private static final class NoOpJavaMailSender implements JavaMailSender {
        private static final Session SESSION = Session.getDefaultInstance(new Properties());

        @Override
        public jakarta.mail.internet.MimeMessage createMimeMessage() {
            return new jakarta.mail.internet.MimeMessage(SESSION);
        }

        @Override
        public jakarta.mail.internet.MimeMessage createMimeMessage(InputStream contentStream) {
            return createMimeMessage();
        }

        @Override
        public void send(jakarta.mail.internet.MimeMessage mimeMessage) {
        }

        @Override
        public void send(jakarta.mail.internet.MimeMessage... mimeMessages) {
        }

        @Override
        public void send(org.springframework.mail.SimpleMailMessage simpleMessage) {
        }

        @Override
        public void send(org.springframework.mail.SimpleMailMessage... simpleMessages) {
        }
    }
}
