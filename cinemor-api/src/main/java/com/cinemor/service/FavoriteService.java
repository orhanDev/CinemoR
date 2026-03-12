package com.cinemor.service;

import com.cinemor.entity.Favorite;
import com.cinemor.entity.Movie;
import com.cinemor.repository.FavoriteRepository;
import com.cinemor.repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final MovieRepository movieRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, MovieRepository movieRepository) {
        this.favoriteRepository = favoriteRepository;
        this.movieRepository = movieRepository;
    }

    public List<Movie> getFavorites(Long userId) {
        List<Long> ids = getFavoriteMovieIds(userId);
        if (ids.isEmpty()) return List.of();
        return movieRepository.findAllById(ids);
    }

    public List<Long> getFavoriteMovieIds(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(Favorite::getMovieId)
            .toList();
    }

    @Transactional
    public boolean add(Long userId, Long movieId) {
        if (movieId == null) return false;
        if (favoriteRepository.existsByUserIdAndMovieId(userId, movieId)) return true;
        Favorite f = new Favorite();
        f.setUserId(userId);
        f.setMovieId(movieId);
        favoriteRepository.save(f);
        return true;
    }

    @Transactional
    public void remove(Long userId, Long movieId) {
        favoriteRepository.deleteByUserIdAndMovieId(userId, movieId);
    }

    public boolean isFavorite(Long userId, Long movieId) {
        return userId != null && movieId != null && favoriteRepository.existsByUserIdAndMovieId(userId, movieId);
    }
}
