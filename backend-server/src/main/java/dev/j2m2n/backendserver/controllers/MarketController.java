package dev.j2m2n.backendserver.controllers;

import dev.j2m2n.backendserver.services.LostArkApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // 프론트엔드 주소 허용
public class MarketController {

    private final LostArkApiService lostArkApiService;

    // [신규] 실시간 로아 API 데이터 조회
    // 예: GET http://localhost:8080/api/v1/market/real-time/50010 (50010은 재련재료 코드)
    @GetMapping("/real-time/{categoryCode}")
    public ResponseEntity<List<LostArkApiService.MarketItemDto>> getRealTimeMarket(
            @PathVariable int categoryCode
    ) {
        List<LostArkApiService.MarketItemDto> result = lostArkApiService.searchItems(categoryCode);
        return ResponseEntity.ok(result);
    }
}