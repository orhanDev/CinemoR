package com.cinemor.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/showtime")
public class ShowtimeController {

    @GetMapping("/upcoming/{movieId}")
    public ResponseEntity<Map<String, Object>> getUpcomingByMovie(@PathVariable Long movieId) {
        List<?> content = getUpcomingShowtimesForMovie(movieId);
        return ResponseEntity.ok(Map.of(
                "object", Map.of("content", content)
        ));
    }

    @GetMapping("/{showtimeId}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long showtimeId) {
        return ResponseEntity.ok(Collections.emptyMap());
    }

    private List<?> getUpcomingShowtimesForMovie(Long movieId) {
        return Collections.emptyList();
    }
}
