package dev.j2m2n.backendserver.services;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LostArkApiService {

    // application.yml의 lostark.api.url 값을 가져옴
    @Value("${lostark.api.url}")
    private String apiUrl;

    // application.yml의 lostark.api.key 값을 가져옴
    @Value("${lostark.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // [핵심] 아이템 검색 (카테고리 코드로 검색)
    public List<MarketItemDto> searchItems(int categoryCode) {
        // 1. 헤더 설정 (인증)
        HttpHeaders headers = new HttpHeaders();
        // yml에 있는 키 앞에 'Bearer '를 붙여서 전송
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        // 2. 요청 바디 설정 (검색 조건)
        // 재련 재료(50010)를 등급 높은순(GRADE DESC)으로 정렬해서 요청
        Map<String, Object> body = new HashMap<>();
        body.put("Sort", "GRADE");
        body.put("SortCondition", "DESC");
        body.put("CategoryCode", categoryCode);
        body.put("PageNo", 1);

        // * 아이템 티어 4만 보고 싶다면 아래 주석 해제 (필요시)
         body.put("ItemTier", 4);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            // 3. API 호출 (POST 방식)
            ResponseEntity<MarketResponse> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    request,
                    MarketResponse.class
            );
            return response.getBody() != null ? response.getBody().getItems() : Collections.emptyList();
        } catch (Exception e) {
            System.err.println("로스트아크 API 호출 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    // --- 내부 DTO 클래스 (로아 API 응답 구조 매핑) ---
    @Getter @Setter
    public static class MarketResponse {
        @JsonProperty("PageNo") int pageNo;
        @JsonProperty("PageSize") int pageSize;
        @JsonProperty("TotalCount") int totalCount;
        @JsonProperty("Items") List<MarketItemDto> items;
    }

    @Getter @Setter
    public static class MarketItemDto {
        @JsonProperty("Id") int id;
        @JsonProperty("Name") String name;
        @JsonProperty("Grade") String grade;
        @JsonProperty("Icon") String icon;
        @JsonProperty("BundleCount") int bundleCount; // 묶음 단위
        @JsonProperty("TradeRemainCount") Integer tradeRemainCount;
        @JsonProperty("YDayAvgPrice") double yDayAvgPrice; // 전일 평균가
        @JsonProperty("RecentPrice") int recentPrice;      // 최근 거래가
        @JsonProperty("CurrentMinPrice") int currentMinPrice; // 최저가
    }
}