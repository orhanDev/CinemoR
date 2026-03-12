package com.cinemor.repository;

import com.cinemor.entity.MenuOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuOrderRepository extends JpaRepository<MenuOrder, Long> {
    List<MenuOrder> findByUserId(Long userId);
}
