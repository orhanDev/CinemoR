package com.cinemor.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "CinemoR API",
                "health", "ok"
        ));
    }

    @GetMapping("/api")
    public ResponseEntity<Map<String, Object>> api() {
        return ResponseEntity.ok(Map.of(
                "service", "CinemoR API",
                "health", "ok"
        ));
    }
}
