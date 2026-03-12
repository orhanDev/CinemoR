package com.cinemor.controller;

import com.cinemor.dto.BuyTicketRequest;
import com.cinemor.entity.Ticket;
import com.cinemor.service.TicketService;
import com.cinemor.service.TokenStore;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final TokenStore tokenStore;

    public TicketController(TicketService ticketService, TokenStore tokenStore) {
        this.ticketService = ticketService;
        this.tokenStore = tokenStore;
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        String token = auth.substring(7).trim();
        return tokenStore.getUserId(token);
    }

    @PostMapping("/buy-ticket")
    public ResponseEntity<Ticket> buyTicket(@RequestBody BuyTicketRequest body, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Ticket ticket = ticketService.buyTicket(userId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping("/auth/current-tickets")
    public ResponseEntity<List<Ticket>> getCurrentTickets(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ticketService.getCurrentTickets(userId));
    }

    @GetMapping("/auth/passed-tickets")
    public ResponseEntity<List<Ticket>> getPassedTickets(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ticketService.getPassedTickets(userId));
    }
}
