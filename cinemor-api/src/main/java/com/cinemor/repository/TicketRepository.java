package com.cinemor.repository;

import com.cinemor.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserIdOrderByShowDateDescShowTimeDesc(Long userId);

    List<Ticket> findByUserIdAndShowDateGreaterThanEqualOrderByShowDateAscShowTimeAsc(Long userId, LocalDate date);

    List<Ticket> findByUserIdAndShowDateLessThanOrderByShowDateDescShowTimeDesc(Long userId, LocalDate date);
}
