package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LostArkApiService {

    @Value("${lostark.api.key}")
    private String apiKey;

    private static final String API_URL = "https://developer-lostark.game.onstove.com/markets/items";
    private final RestTemplate restTemplate = new RestTemplate();

    public List<LostArkMarketItemDto> searchItems(int categoryCode, String itemName, Integer tier) {
        List<LostArkMarketItemDto> allItems = new ArrayList<>();
        int pageNo = 1;
        // 최대 5페이지까지 조회 (보통 한 페이지에 10개이므로 50개면 충분)
        final int MAX_PAGES = 5;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            while (pageNo <= MAX_PAGES) {
                Map<String, Object> body = new HashMap<>();
                body.put("Sort", "CURRENT_MIN_PRICE");
                body.put("SortCondition", "DESC"); // 비싼 순
                body.put("CategoryCode", categoryCode);
                body.put("ItemTier", tier != null ? tier : 3);
                body.put("PageNo", pageNo); // 페이지 번호 변경

                if (itemName != null && !itemName.isEmpty() && !itemName.equals("전체")) {
                    body.put("ItemName", itemName);
                }

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(API_URL, request, Map.class);

                if (response.getBody() == null || !response.getBody().containsKey("Items")) {
                    break; // 아이템이 없으면 중단
                }

                List<Map<String, Object>> rawItems = (List<Map<String, Object>>) response.getBody().get("Items");

                // 데이터가 비어있으면 루프 종료
                if (rawItems == null || rawItems.isEmpty()) {
                    break;
                }

                // DTO 변환 후 리스트에 추가
                List<LostArkMarketItemDto> pageItems = rawItems.stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList());
                allItems.addAll(pageItems);

                pageNo++; // 다음 페이지로
            }

        } catch (Exception e) {
            log.error("로스트아크 API 호출 실패: {}", e.getMessage());
        }

        return allItems;
    }

    private LostArkMarketItemDto convertToDto(Map<String, Object> raw) {
        String name = (String) raw.get("Name");
        String grade = (String) raw.get("Grade");
        String iconUrl = (String) raw.get("Icon");
        int bundle = (int) raw.get("BundleCount");
        int minPrice = (int) raw.get("CurrentMinPrice");
        int recentPrice = (int) raw.get("RecentPrice");
        double avgPrice = ((Number) raw.get("YDayAvgPrice")).doubleValue();

        double changeRate = 0;
        if (avgPrice > 0) {
            changeRate = ((minPrice - avgPrice) / avgPrice) * 100;
            changeRate = Math.round(changeRate * 10.0) / 10.0;
        }

        return new LostArkMarketItemDto(
                UUID.randomUUID().toString(),
                name,
                grade,
                bundle,
                minPrice,
                recentPrice,
                (int) avgPrice,
                changeRate,
                iconUrl
        );
    }
}