package com.cinemor.service;

import com.cinemor.entity.MenuOrder;
import com.cinemor.repository.MenuOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuOrderService {
    private final MenuOrderRepository menuOrderRepository;

    public MenuOrderService(MenuOrderRepository menuOrderRepository) {
        this.menuOrderRepository = menuOrderRepository;
    }

    public MenuOrder saveOrder(MenuOrder order) {
        return menuOrderRepository.save(order);
    }

    public List<MenuOrder> getOrdersByUserId(Long userId) {
        return menuOrderRepository.findByUserId(userId);
    }
}
