package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.LostArkCharacterDto;
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
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LostArkApiService {

    @Value("${lostark.api.key}")
    private String apiKey;

    private static final String MARKET_API_URL = "https://developer-lostark.game.onstove.com/markets/items";
    private static final String AUCTION_API_URL = "https://developer-lostark.game.onstove.com/auctions/items";
    private static final String CHARACTER_API_URL = "https://developer-lostark.game.onstove.com/armories/characters";
    
    private final RestTemplate restTemplate = new RestTemplate();

    // [기존] 거래소 아이템 검색
    public List<LostArkMarketItemDto> searchItems(int categoryCode, String itemName, Integer tier, String grade) {
        List<LostArkMarketItemDto> allItems = new ArrayList<>();
        int pageNo = 1;
        final int MAX_PAGES = 5;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            while (pageNo <= MAX_PAGES) {
                Map<String, Object> body = new HashMap<>();
                
                // [수정] API 호출 시 정렬은 기본값(최저가순)으로 요청하고, 서비스 단에서 재정렬하도록 변경
                // 잘못된 Sort 파라미터로 인한 API 오류 방지
                body.put("Sort", "CURRENT_MIN_PRICE");
                body.put("SortCondition", "ASC");

                body.put("CategoryCode", categoryCode);
                
                // 생활(90000), 각인서(40000), 배틀아이템(60000~)은 티어 필터 제외
                if (categoryCode != 90000 && categoryCode != 40000 && categoryCode / 10000 != 6) {
                    body.put("ItemTier", tier != null ? tier : 3);
                }
                
                if (grade != null && !grade.isEmpty()) {
                    body.put("ItemGrade", grade);
                }
                
                body.put("PageNo", pageNo);

                if (itemName != null && !itemName.isEmpty() && !itemName.equals("전체")) {
                    body.put("ItemName", itemName);
                }

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(MARKET_API_URL, request, Map.class);

                if (response.getBody() == null || !response.getBody().containsKey("Items")) {
                    break;
                }

                List<Map<String, Object>> rawItems = (List<Map<String, Object>>) response.getBody().get("Items");

                if (rawItems == null || rawItems.isEmpty()) {
                    break;
                }

                List<LostArkMarketItemDto> pageItems = rawItems.stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList());
                allItems.addAll(pageItems);

                pageNo++;
            }

        } catch (Exception e) {
            log.error("로스트아크 거래소 API 호출 실패: {}", e.getMessage());
        }

        return allItems;
    }

    // [추가] 경매장 아이템 검색 (보석용)
    public List<LostArkMarketItemDto> searchAuctionItems(int categoryCode, String itemName, Integer tier) {
        List<LostArkMarketItemDto> allItems = new ArrayList<>();
        int pageNo = 1;
        final int MAX_PAGES = 5; // 보석은 매물이 많을 수 있으니 적당히 제한

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            while (pageNo <= MAX_PAGES) {
                Map<String, Object> body = new HashMap<>();
                body.put("Sort", "BUY_PRICE"); // 즉시 구매가 기준
                body.put("SortCondition", "ASC"); // 싼 순서 (최저가)
                body.put("CategoryCode", categoryCode);
                body.put("ItemTier", tier != null ? tier : 3);
                body.put("PageNo", pageNo);

                // [수정] itemName이 null이거나 "전체"인 경우, 보석(210000)은 "보석"이라는 키워드로 검색해야 전체 조회가 됨
                // 경매장 API는 ItemName이 없으면 검색이 안 되는 경우가 있음 (특히 보석)
                if (itemName != null && !itemName.isEmpty() && !itemName.equals("전체")) {
                    body.put("ItemName", itemName);
                } else if (categoryCode == 210000) {
                    body.put("ItemName", "보석"); // 보석 전체 조회 시 "보석" 키워드 추가
                }

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(AUCTION_API_URL, request, Map.class);

                if (response.getBody() == null || !response.getBody().containsKey("Items")) {
                    break;
                }

                List<Map<String, Object>> rawItems = (List<Map<String, Object>>) response.getBody().get("Items");

                if (rawItems == null || rawItems.isEmpty()) {
                    break;
                }

                List<LostArkMarketItemDto> pageItems = rawItems.stream()
                        .map(this::convertAuctionToDto)
                        .collect(Collectors.toList());
                allItems.addAll(pageItems);

                pageNo++;
            }

        } catch (Exception e) {
            log.error("로스트아크 경매장 API 호출 실패: {}", e.getMessage());
        }

        return allItems;
    }

    // [추가] 캐릭터 정보 검색
    public LostArkCharacterDto getCharacterInfo(String characterName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(headers);
            
            // URL 인코딩 처리
            String encodedName = URLEncoder.encode(characterName, StandardCharsets.UTF_8.toString());
            // [수정] URL 인코딩 시 '+' 기호가 공백으로 인식되는 문제 방지 (%2B로 명시적 인코딩)
            // filters=profiles+equipment -> filters=profiles%2Bequipment
            String url = CHARACTER_API_URL + "/" + encodedName + "?filters=profiles%2Bequipment";

            ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, request, Map.class);
            
            if (response.getBody() == null) {
                return null;
            }
            
            Map<String, Object> body = response.getBody();
            
            // 프로필 정보 파싱
            Map<String, Object> profile = (Map<String, Object>) body.get("ArmoryProfile");
            if (profile == null) return null;
            
            String serverName = (String) profile.get("ServerName");
            int level = (int) profile.get("CharacterLevel");
            String className = (String) profile.get("CharacterClassName");
            String itemAvgLevel = (String) profile.get("ItemAvgLevel");
            String itemMaxLevel = (String) profile.get("ItemMaxLevel");
            
            // 장비 정보 파싱
            List<LostArkCharacterDto.EquipmentDto> equipmentList = new ArrayList<>();
            List<Map<String, Object>> equipmentRaw = (List<Map<String, Object>>) body.get("ArmoryEquipment");
            
            if (equipmentRaw != null) {
                for (Map<String, Object> eq : equipmentRaw) {
                    String type = (String) eq.get("Type");
                    String name = (String) eq.get("Name");
                    String icon = (String) eq.get("Icon");
                    String grade = (String) eq.get("Grade");
                    
                    equipmentList.add(new LostArkCharacterDto.EquipmentDto(type, name, icon, grade));
                }
            }

            return new LostArkCharacterDto(
                    serverName,
                    characterName,
                    level,
                    className,
                    itemAvgLevel,
                    itemMaxLevel,
                    equipmentList
            );

        } catch (Exception e) {
            log.error("로스트아크 캐릭터 API 호출 실패: {}", e.getMessage());
            return null;
        }
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

    // [추가] 경매장 데이터 DTO 변환
    private LostArkMarketItemDto convertAuctionToDto(Map<String, Object> raw) {
        String name = (String) raw.get("Name");
        String grade = (String) raw.get("Grade");
        String iconUrl = (String) raw.get("Icon");
        
        Map<String, Object> auctionInfo = (Map<String, Object>) raw.get("AuctionInfo");
        int minPrice = 0;
        int startPrice = 0;
        
        if (auctionInfo != null) {
            // 즉시 구매가가 있으면 사용, 없으면 시작가 사용 (보통 즉구가 기준)
            Object buyPriceObj = auctionInfo.get("BuyPrice");
            Object startPriceObj = auctionInfo.get("StartPrice");
            
            minPrice = buyPriceObj != null ? (int) buyPriceObj : 0;
            startPrice = startPriceObj != null ? (int) startPriceObj : 0;
            
            // 즉시 구매가가 0이면(매물이 없거나 입찰 전용) 시작가로 표시할 수도 있음
            if (minPrice == 0) minPrice = startPrice;
        }

        // 경매장은 전일 평균가, 최근 거래가 정보가 없으므로 0 처리
        return new LostArkMarketItemDto(
                UUID.randomUUID().toString(),
                name,
                grade,
                1, // 보석은 1개 단위
                minPrice,
                0, // 최근 거래가 없음
                0, // 전일 평균가 없음
                0, // 등락률 없음
                iconUrl
        );
    }
}