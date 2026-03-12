package com.cinemor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("com.cinemor.repository")
@EntityScan("com.cinemor.entity")
public class CinemorApplication {

    public static void main(String[] args) {
        SpringApplication.run(CinemorApplication.class, args);
    }
}
