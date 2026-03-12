package com.cinemor.service;

import com.cinemor.dto.BuyTicketRequest;
import com.cinemor.entity.Ticket;
import com.cinemor.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public Ticket buyTicket(Long userId, BuyTicketRequest request) {
        LocalDate showDate = null;
        if (request.getShowDate() != null && !request.getShowDate().isBlank()) {
            try {
                showDate = LocalDate.parse(request.getShowDate().substring(0, 10));
            } catch (Exception ignored) {
            }
        }
        String seatsStr = request.getSeats() != null
            ? String.join(",", request.getSeats())
            : "";

        Ticket ticket = new Ticket();
        ticket.setUserId(userId);
        ticket.setMovieTitle(request.getMovieTitle() != null ? request.getMovieTitle() : "");
        ticket.setMovieId(request.getMovieId());
        ticket.setCinemaName(request.getCinemaName());
        ticket.setShowDate(showDate);
        ticket.setShowTime(request.getShowTime());
        ticket.setSeats(seatsStr);
        ticket.setPrice(request.getPrice());
        ticket.setTicketCode(request.getTicketCode() != null ? request.getTicketCode() : "");
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getCurrentTickets(Long userId) {
        LocalDate today = LocalDate.now();
        return ticketRepository.findByUserIdAndShowDateGreaterThanEqualOrderByShowDateAscShowTimeAsc(userId, today);
    }

    public List<Ticket> getPassedTickets(Long userId) {
        LocalDate today = LocalDate.now();
        return ticketRepository.findByUserIdAndShowDateLessThanOrderByShowDateDescShowTimeDesc(userId, today);
    }
}
