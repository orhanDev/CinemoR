package com.cinemor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "original_title", length = 255)
    private String originalTitle;

    @Column(length = 100)
    private String genre;

    @Column(length = 50)
    private String duration;

    @Column(length = 255)
    private String director;

    @Column(name = "movie_cast", columnDefinition = "TEXT")
    private String cast;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(length = 10)
    private String year;

    @Column(length = 100)
    private String country;

    @Column(name = "release_date", length = 20)
    private String releaseDate;

    @Column(length = 50)
    private String fsk;

    @Column(name = "is_coming_soon")
    private Boolean isComingSoon = true;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }

    public LocalDate getReleaseDateAsLocalDate() {
        if (releaseDate == null || releaseDate.isEmpty()) {
            return null;
        }
        try {
            String[] parts = releaseDate.split("\\.");
            if (parts.length == 3) {
                int day = Integer.parseInt(parts[0]);
                int month = Integer.parseInt(parts[1]);
                int yearVal = Integer.parseInt(parts[2]);
                if (yearVal < 100) {
                    yearVal += 2000;
                }
                return LocalDate.of(yearVal, month, day);
            }
        } catch (Exception e) {
        }
        return null;
    }
}
