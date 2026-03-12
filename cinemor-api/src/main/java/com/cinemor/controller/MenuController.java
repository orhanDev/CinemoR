package com.cinemor.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.cinemor.entity.MenuOrder;
import com.cinemor.service.MenuOrderService;
import com.cinemor.service.TokenStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    @GetMapping("/items")
    public ResponseEntity<List<Map<String, Object>>> getMenuItems() {
        try {
            String menuPath = "cinemor-react/public/images/menu";
            Path[] possiblePaths = {
                Paths.get(menuPath),
                Paths.get("../cinemor-react/public/images/menu"),
                Paths.get("../../cinemor-react/public/images/menu"),
                Paths.get("public/images/menu"),
                Paths.get("src/main/resources/static/images/menu")
            };
            
            Path menuDir = null;
            for (Path path : possiblePaths) {
                if (Files.exists(path) && Files.isDirectory(path)) {
                    menuDir = path;
                    break;
                }
            }
            
            if (menuDir == null) {
                return ResponseEntity.ok(getDefaultMenuItems());
            }
            
            List<Map<String, Object>> menuItems = new ArrayList<>();
            File[] files = menuDir.toFile().listFiles((dir, name) -> 
                name.toLowerCase().endsWith(".png") || 
                name.toLowerCase().endsWith(".jpg") || 
                name.toLowerCase().endsWith(".jpeg")
            );
            
            if (files != null) {
                for (File file : files) {
                    Map<String, Object> item = new HashMap<>();
                    String fileName = file.getName();
                    String nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
                    String displayName = formatMenuName(nameWithoutExt);
                    item.put("id", nameWithoutExt.toLowerCase().replaceAll("[^a-z0-9]", "-"));
                    item.put("name", displayName);
                    item.put("image", "/images/menu/" + fileName);
                    item.put("price", getDefaultPrice(displayName));
                    item.put("description", getDefaultDescription(displayName));
                    
                    menuItems.add(item);
                }
            }
            
            return ResponseEntity.ok(menuItems.isEmpty() ? getDefaultMenuItems() : menuItems);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(getDefaultMenuItems());
        }
    }
    
    private String formatMenuName(String fileName) {
        String[] parts = fileName.split("[_-]");
        StringBuilder result = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                result.append(Character.toUpperCase(part.charAt(0)));
                if (part.length() > 1) {
                    result.append(part.substring(1));
                }
                result.append(" ");
            }
        }
        return result.toString().trim();
    }
    
    private Double getDefaultPrice(String name) {
        String lowerName = name.toLowerCase();
        if (lowerName.contains("extra") && lowerName.contains("groß")) return 18.50;
        if (lowerName.contains("extra")) return 15.90;
        if (lowerName.contains("groß") || lowerName.contains("goß")) return 14.50;
        if (lowerName.contains("kinder")) return 9.90;
        if (lowerName.contains("rio") || lowerName.contains("santo")) return 16.90;
        if (lowerName.contains("coca") || lowerName.contains("cola")) return 4.50;
        if (lowerName.contains("fanta")) return 4.50;
        if (lowerName.contains("fruchtsaft")) return 4.90;
        if (lowerName.contains("ice") && lowerName.contains("tea")) return 4.50;
        if (lowerName.contains("wasser")) return 3.50;
        return 4.50;
    }
    
    private String getDefaultDescription(String name) {
        String lowerName = name.toLowerCase();
        if (lowerName.contains("kinder")) return "Kinderfreundliches Menü";
        if (lowerName.contains("rio") || lowerName.contains("santo")) return "Rio Santo Spezial Menü";
        if (lowerName.contains("extra") && lowerName.contains("groß")) return "Extra großes Menü mit Getränk";
        if (lowerName.contains("extra")) return "Extra Menü mit Getränk";
        if (lowerName.contains("groß") || lowerName.contains("goß")) return "Großes Menü mit Getränk";
        if (lowerName.contains("coca") || lowerName.contains("cola")) return "Erfrischendes Cola-Getränk";
        if (lowerName.contains("fanta")) return "Erfrischendes Orangen-Getränk";
        if (lowerName.contains("fruchtsaft")) return "Natürlicher Fruchtsaft";
        if (lowerName.contains("ice") && lowerName.contains("tea")) return "Erfrischender Eistee";
        if (lowerName.contains("wasser")) return "Erfrischendes Mineralwasser";
        return "Getränk";
    }
    
    private List<Map<String, Object>> getDefaultMenuItems() {
        List<Map<String, Object>> defaultItems = new ArrayList<>();
        
        String[] defaultMenus = {
            "extra_großes_menu.png", "extra_menu.png", "goßes_menu.png", 
            "kinder_menu.png", "rio_santo_menu.png"
        };
        
        double[] menuPrices = {18.50, 15.90, 14.50, 9.90, 16.90};
        String[] menuNames = {
            "Extra Großes Menu", "Extra Menu", "Großes Menu", 
            "Kinder Menu", "Rio Santo Menu"
        };
        String[] menuDescriptions = {
            "Extra großes Menü mit Getränk", "Extra Menü mit Getränk", 
            "Großes Menü mit Getränk", "Kinderfreundliches Menü", 
            "Rio Santo Spezial Menü"
        };
        
        for (int i = 0; i < defaultMenus.length; i++) {
            Map<String, Object> item = new HashMap<>();
            String fileName = defaultMenus[i];
            String nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            
            item.put("id", nameWithoutExt.toLowerCase().replaceAll("[^a-z0-9]", "-"));
            item.put("name", menuNames[i]);
            item.put("image", "/images/menu/" + fileName);
            item.put("price", menuPrices[i]);
            item.put("description", menuDescriptions[i]);
            
            defaultItems.add(item);
        }
        
        String[] defaultDrinks = {
            "Coca_cola.png", "Fanta.png", "Fruchtsaft.png", 
            "Ice_Tea.png", "Wasser.png"
        };
        
        double[] drinkPrices = {4.50, 4.50, 4.90, 4.50, 3.50};
        String[] drinkNames = {
            "Coca Cola", "Fanta", "Fruchtsaft", 
            "Ice Tea", "Wasser"
        };
        String[] drinkDescriptions = {
            "Erfrischendes Cola-Getränk", "Erfrischendes Orangen-Getränk", 
            "Natürlicher Fruchtsaft", "Erfrischender Eistee", 
            "Erfrischendes Mineralwasser"
        };
        
        for (int i = 0; i < defaultDrinks.length; i++) {
            Map<String, Object> item = new HashMap<>();
            String fileName = defaultDrinks[i];
            String nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            
            item.put("id", nameWithoutExt.toLowerCase().replaceAll("[^a-z0-9]", "-"));
            item.put("name", drinkNames[i]);
            item.put("image", "/images/menu/" + fileName);
            item.put("price", drinkPrices[i]);
            item.put("description", drinkDescriptions[i]);
            
            defaultItems.add(item);
        }
        
        return defaultItems;
    }

    private final MenuOrderService menuOrderService;
    private final TokenStore tokenStore;

    @Autowired
    public MenuController(MenuOrderService menuOrderService, TokenStore tokenStore) {
        this.menuOrderService = menuOrderService;
        this.tokenStore = tokenStore;
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        String token = auth.substring(7).trim();
        return tokenStore.getUserId(token);
    }

    @PostMapping("/order")
    public ResponseEntity<MenuOrder> placeOrder(@RequestBody MenuOrder order, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        order.setUserId(userId);
        MenuOrder saved = menuOrderService.saveOrder(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/orders/me")
    public ResponseEntity<List<MenuOrder>> getMyOrders(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(menuOrderService.getOrdersByUserId(userId));
    }
}
