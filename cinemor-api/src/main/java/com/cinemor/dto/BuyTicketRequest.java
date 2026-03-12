package com.cinemor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuyTicketRequest {
    private String movieTitle;
    private Long movieId;
    private String cinemaName;
    private String showDate;
    private String showTime;
    private List<String> seats;
    private BigDecimal price;
    private String ticketCode;
}
