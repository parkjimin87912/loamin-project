package dev.j2m2n.backendserver.controllers;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import dev.j2m2n.backendserver.dtos.PredictionDto;
import dev.j2m2n.backendserver.entities.MarketPriceHistory;
import dev.j2m2n.backendserver.repositories.MarketPriceHistoryRepository;
import dev.j2m2n.backendserver.services.MarketDataService;
import dev.j2m2n.backendserver.services.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;
    private final PredictionService predictionService;
    private final MarketPriceHistoryRepository historyRepository;

    @GetMapping("/items")
    public List<LostArkMarketItemDto> getItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false, defaultValue = "4") Integer tier
    ) {
        return marketDataService.getItems(category, subCategory, tier);
    }

    @GetMapping("/predict")
    public PredictionDto predictItemPrice(@RequestParam String itemName) {
        return predictionService.getPrediction(itemName);
    }

    // 🌟 수정: 엔티티를 그대로 반환하지 않고, Map을 이용해 필요한 데이터만 깔끔하게 만들어서 반환!
    @GetMapping("/history")
    public List<Map<String, Object>> getItemHistory(@RequestParam String itemName) {
        List<MarketPriceHistory> histories = historyRepository.findByItem_ItemNameOrderByCollectedAtAsc(itemName);

        List<Map<String, Object>> result = new ArrayList<>();
        for (MarketPriceHistory history : histories) {
            Map<String, Object> map = new HashMap<>();
            map.put("price", history.getPrice());
            map.put("tradeCount", history.getTradeCount());
            // 프론트엔드에서 파싱하기 쉽게 문자열로 변환해서 전달
            map.put("collectedAt", history.getCollectedAt().toString());
            result.add(map);
        }

        return result;
    }
}