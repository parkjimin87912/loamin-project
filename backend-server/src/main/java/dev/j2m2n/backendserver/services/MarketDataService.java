package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
            // [수정] 배틀 아이템은 전체(60000)를 조회한 후 이름으로 필터링 (API 카테고리 코드 미동작 이슈 대응)
            categoryCode = 60000;
            tier = null; 
        }

        log.info("Fetching items for category: {}, subCategory: {}, categoryCode: {}", category, subCategory, categoryCode);

        // 2. API 호출
        List<LostArkMarketItemDto> items;
        if (isAuction) {
            // [수정] 보석 '전체' 탭일 경우 7~10레벨 보석을 각각 조회하여 합침
            if ("gem".equals(category) && (subCategory == null || subCategory.equals("전체"))) {
                items = new ArrayList<>();
                String[] levels = {"10레벨", "9레벨", "8레벨", "7레벨"};
                for (String level : levels) {
                    items.addAll(lostArkApiService.searchAuctionItems(categoryCode, level, tier));
                }
                // [추가] 전체 조회 시 최저가 순으로 정렬
                items.sort(Comparator.comparingInt(LostArkMarketItemDto::getMinPrice));
            } else {
                items = lostArkApiService.searchAuctionItems(categoryCode, itemName, tier);
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

        // [추가] 배틀 아이템 필터링 및 정렬 로직
        if ("battle".equals(category)) {
            // 1. 서브 카테고리 이름 필터링 (사용자 요청: 이름으로 분류)
            if (subCategory != null && !subCategory.equals("전체")) {
                final String sub = subCategory.trim();
                items = items.stream()
                        .filter(item -> {
                            String name = item.getName();
                            if ("회복".equals(sub) || "회복형".equals(sub)) {
                                return name.contains("회복약");
                            } else if ("공격".equals(sub) || "공격형".equals(sub)) {
                                return name.contains("폭탄") || name.contains("수류탄") || name.contains("파괴");
                            } else if ("기능".equals(sub) || "기능성".equals(sub)) {
                                return name.contains("신호탄") || name.contains("페로몬") || name.contains("부적") || 
                                       name.contains("로브") || name.contains("허수아비") || name.contains("시간 정지") || name.contains("정비");
                            } else if ("버프".equals(sub) || "버프형".equals(sub)) {
                                return (name.contains("각성약") || name.contains("아드로핀") || name.contains("물약")) &&
                                       !name.contains("회복약") && !name.contains("시간 정지");
                            }
                            return true;
                        })
                        .collect(Collectors.toList());
            }

            // 2. 최저가 또는 최근 거래가가 1000골드 이상인 아이템 제외
            items = items.stream()
                    .filter(item -> item.getMinPrice() < 1000 && item.getRecentPrice() < 1000)
                    .collect(Collectors.toList());

            // 3. 최근 거래가 기준 내림차순 정렬
            items.sort((o1, o2) -> Integer.compare(o2.getRecentPrice(), o1.getRecentPrice()));
        }

        return items;
    }
}