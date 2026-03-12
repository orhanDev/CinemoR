package com.cinemor.service;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {
    private final ConcurrentHashMap<String, Long> tokenToUserId = new ConcurrentHashMap<>();

    public void put(String token, Long userId) {
        tokenToUserId.put(token, userId);
    }

    public Long getUserId(String token) {
        return tokenToUserId.get(token);
    }
}
