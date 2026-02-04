package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private final LostArkApiService lostArkApiService;

    public List<LostArkMarketItemDto> getItems(String category, String subCategory, Integer tier) {
        int categoryCode = 50010; // 기본값: 재련 재료
        String itemName = null;
        String grade = null; // 등급 필터링 변수
        boolean isAuction = false; // [추가] 경매장 사용 여부

        // 1. 카테고리 코드 매핑
        if ("reforge".equals(category)) {
            if ("재련 보조 재료".equals(subCategory)) {
                categoryCode = 50020;
            } else {
                categoryCode = 50010;
            }
        } else if ("gem".equals(category)) {
            categoryCode = 210000;
            isAuction = true; // [추가] 보석은 경매장 API 사용
            
            // 보석 레벨 필터링 (이름으로 검색)
            if (subCategory != null && subCategory.contains("레벨")) {
                itemName = subCategory; // 예: "7레벨" -> 이름에 "7레벨" 포함된 것 검색
            }
        } else if ("engraving".equals(category)) {
            categoryCode = 40000; // 각인서
            tier = null; // 각인서는 티어 구분 없음
            grade = "유물"; // 유물 등급만 조회
        } else if ("life".equals(category)) {
            categoryCode = 90000;
            tier = null;
        } else if ("battle".equals(category)) {
            categoryCode = 60000;
        }

        // 2. API 호출
        List<LostArkMarketItemDto> items;
        if (isAuction) {
            // [추가] 경매장 API 호출 (보석)
            items = lostArkApiService.searchAuctionItems(categoryCode, itemName, tier);
            
            // [추가] 보석 '전체' 탭일 경우 7레벨 이상만 필터링
            if ("gem".equals(category) && (subCategory == null || subCategory.equals("전체"))) {
                items = items.stream()
                        .filter(item -> {
                            String name = item.getName();
                            // "10레벨", "9레벨", "8레벨", "7레벨" 문자열 포함 여부 확인
                            return name.contains("10레벨") || name.contains("9레벨") || name.contains("8레벨") || name.contains("7레벨");
                        })
                        .collect(Collectors.toList());
            }
        } else {
            // 기존 거래소 API 호출
            items = lostArkApiService.searchItems(categoryCode, itemName, tier, grade);
        }

        // 3. 생활 재료 필터링
        if ("life".equals(category) && subCategory != null && !subCategory.equals("전체")) {
            String filterKeyword = "";
            switch (subCategory) {
                case "채광": filterKeyword = "철광석"; break;
                case "벌목": filterKeyword = "목재"; break;
                case "기타": filterKeyword = "제작 키트"; break;
            }

            if (!filterKeyword.isEmpty()) {
                final String keyword = filterKeyword;
                items = items.stream()
                        .filter(item -> item.getName().contains(keyword))
                        .collect(Collectors.toList());
            } else {
                if (subCategory.equals("고고학")) {
                    items = items.stream()
                            .filter(item -> item.getName().contains("유물") || item.getName().contains("고고학"))
                            .collect(Collectors.toList());
                } else if (subCategory.equals("낚시")) {
                    items = items.stream()
                            .filter(item -> item.getName().contains("생선") || item.getName().contains("잉어") || item.getName().contains("진주"))
                            .collect(Collectors.toList());
                } else if (subCategory.equals("채집")) {
                    items = items.stream()
                            .filter(item -> item.getName().contains("들꽃") || item.getName().contains("버섯"))
                            .collect(Collectors.toList());
                } else if (subCategory.equals("수렵")) {
                    items = items.stream()
                            .filter(item -> item.getName().contains("고기") || item.getName().contains("가죽"))
                            .collect(Collectors.toList());
                }
            }
        }

        return items;
    }
}