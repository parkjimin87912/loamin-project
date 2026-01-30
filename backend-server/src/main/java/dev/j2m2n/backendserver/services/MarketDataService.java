package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.PredictionDto;
import dev.j2m2n.backendserver.entities.ItemMeta;
import dev.j2m2n.backendserver.entities.MarketPriceHistory;
import dev.j2m2n.backendserver.repositories.ItemMetaRepository;
import dev.j2m2n.backendserver.repositories.MarketPriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketDataService {

    private final MarketPriceHistoryRepository marketPriceHistoryRepository;
    private final ItemMetaRepository itemMetaRepository; // [필수] 아이템 이름 조회용
    private final PredictionService predictionService;   // [필수] 예측 엔진

    // 1. 시세 기록 조회
    public List<MarketPriceHistoryDto> getPriceHistory(String itemName) {
        List<MarketPriceHistory> histories = marketPriceHistoryRepository.findByItem_ItemNameOrderByCollectedAtAsc(itemName);
        return histories.stream()
                .map(h -> new MarketPriceHistoryDto(
                        h.getPrice(),
                        h.getTradeCount(),
                        h.getCollectedAt().toString()
                ))
                .collect(Collectors.toList());
    }

    // 2. [이게 없어서 에러 발생] 저장된 아이템 이름 목록 조회
    public List<String> getAllItemNames() {
        return itemMetaRepository.findAll().stream()
                .map(ItemMeta::getItemName)
                .collect(Collectors.toList());
    }

    // 3. 시세 예측 (자바 엔진 사용)
    public PredictionDto getPrediction(String itemName) {
        // DB에서 가격 데이터만 추출
        List<MarketPriceHistory> histories = marketPriceHistoryRepository.findByItem_ItemNameOrderByCollectedAtAsc(itemName);
        List<Integer> prices = histories.stream()
                .map(MarketPriceHistory::getPrice)
                .collect(Collectors.toList());

        // 자바 엔진으로 계산해서 반환
        return predictionService.predictNextPrice(prices);
    }

    // 내부 DTO
    public record MarketPriceHistoryDto(Integer price, Integer tradeCount, String collectedAt) {}
}