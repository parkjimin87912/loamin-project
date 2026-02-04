package dev.j2m2n.backendserver.controllers;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import dev.j2m2n.backendserver.services.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;

    @GetMapping("/items")
    public List<LostArkMarketItemDto> getItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false, defaultValue = "3") Integer tier // [추가] tier 받기
    ) {
        return marketDataService.getItems(category, subCategory, tier);
    }
}