package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private final LostArkApiService lostArkApiService;

    public List<LostArkMarketItemDto> getItems(String category, String subCategory, Integer tier) {
        int categoryCode = 50010; // 기본값: 재련 재료
        String itemName = null;

        // 1. 카테고리 코드 매핑
        if ("reforge".equals(category)) {
            if ("재련 보조 재료".equals(subCategory)) {
                categoryCode = 50020; // [수정] 재련 보조 재료 (야금술, 재봉술, 숨결)
            } else {
                categoryCode = 50010; // 재련 재료 (파괴석, 수호석, 돌파석, 융화재료)
            }
        } else if ("gem".equals(category)) {
            categoryCode = 210000; // 보석
        } else if ("engraving".equals(category)) {
            categoryCode = 40000; // 각인서
        } else if ("life".equals(category)) {
            categoryCode = 90000; // 생활 재료
        } else if ("battle".equals(category)) {
            categoryCode = 60000; // 배틀 아이템
        }

        // 3. 실제 API 호출
        return lostArkApiService.searchItems(categoryCode, itemName, tier);
    }
}