package dev.j2m2n.backendserver.controllers;

import dev.j2m2n.backendserver.dtos.PredictionDto;
import dev.j2m2n.backendserver.services.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarketController {

    private final MarketDataService marketDataService;

    // 1. 아이템 시세 기록 조회
    // GET /api/v1/market/history/유물 원한 각인서
    @GetMapping("/history/{itemName}")
    public ResponseEntity<List<MarketDataService.MarketPriceHistoryDto>> getItemHistory(
            @PathVariable String itemName
    ) {
        var result = marketDataService.getPriceHistory(itemName);
        return ResponseEntity.ok(result);
    }

    // 2. 수집된 아이템 목록 조회
    // GET /api/v1/market/items
    @GetMapping("/items")
    public ResponseEntity<List<String>> getAllItemNames() {
        var result = marketDataService.getAllItemNames();
        return ResponseEntity.ok(result);
    }

    // 3. 시세 예측 조회 (자바 엔진)
    // GET /api/v1/market/predict/유물 원한 각인서
    @GetMapping("/predict/{itemName}")
    public ResponseEntity<PredictionDto> getPrediction(
            @PathVariable String itemName
    ) {
        var result = marketDataService.getPrediction(itemName);
        return ResponseEntity.ok(result);
    }
}