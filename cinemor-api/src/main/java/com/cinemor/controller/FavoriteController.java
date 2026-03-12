package com.cinemor.controller;

import com.cinemor.dto.AddFavoriteRequest;
import com.cinemor.entity.Movie;
import com.cinemor.service.FavoriteService;
import com.cinemor.service.TokenStore;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final TokenStore tokenStore;

    public FavoriteController(FavoriteService favoriteService, TokenStore tokenStore) {
        this.favoriteService = favoriteService;
        this.tokenStore = tokenStore;
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return tokenStore.getUserId(auth.substring(7).trim());
        }
        return null;
    }

    @GetMapping("/auth")
    public ResponseEntity<List<Movie>> getFavorites(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }

    @GetMapping("/auth/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(favoriteService.getFavoriteMovieIds(userId));
    }

    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody AddFavoriteRequest body, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (body == null || body.getMovieId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "movieId required"));
        }
        boolean added = favoriteService.add(userId, body.getMovieId());
        return added ? ResponseEntity.status(HttpStatus.CREATED).build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long movieId, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        favoriteService.remove(userId, movieId);
        return ResponseEntity.noContent().build();
    }
}
