package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.PredictionDto;
import dev.j2m2n.backendserver.entities.MarketPriceHistory;
import dev.j2m2n.backendserver.repositories.MarketPriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // 추가: 레포지토리를 주입받기 위해 필요
public class PredictionService {

    private final MarketPriceHistoryRepository historyRepository; // 추가

    /**
     * 🌟 새롭게 추가된 메서드: 아이템 이름으로 DB에서 기록을 찾아 예측을 수행
     */
    public PredictionDto getPrediction(String itemName) {
        // 1. DB에서 해당 아이템의 시세 기록을 시간 오름차순으로 가져옴
        List<MarketPriceHistory> histories = historyRepository.findByItem_ItemNameOrderByCollectedAtAsc(itemName);

        // 2. MarketPriceHistory 객체 리스트에서 '가격(price)'만 뽑아서 List<Integer>로 변환
        List<Integer> prices = histories.stream()
                .map(MarketPriceHistory::getPrice)
                .collect(Collectors.toList());

        // 3. 기존에 있던 예측 로직 호출
        return predictNextPrice(prices);
    }

    /**
     * 단순 선형 회귀(Linear Regression)를 사용한 다음 가격 예측 (기존 로직 유지)
     */
    public PredictionDto predictNextPrice(List<Integer> prices) {
        PredictionDto result = new PredictionDto();

        // 데이터가 없거나 1개뿐이면 예측 불가 -> 현재 가격 그대로 반환
        // (💡 나중에는 정확도를 위해 이 조건을 prices.size() < 24 로 늘리셔도 좋습니다)
        if (prices == null || prices.size() < 2) {
            int lastPrice = (prices == null || prices.isEmpty()) ? 0 : prices.get(prices.size() - 1);
            result.setCurrentPrice(lastPrice);
            result.setPredictedPrice(lastPrice);
            result.setTrend("HOLD");
            return result;
        }

        // 1. 회귀 분석 객체 생성
        SimpleRegression regression = new SimpleRegression();

        // 2. 데이터 주입 (X: 시간 순서 0,1,2..., Y: 가격)
        for (int i = 0; i < prices.size(); i++) {
            regression.addData(i, prices.get(i));
        }

        // 3. 다음 지점(마지막 인덱스 + 1) 예측
        int currentPrice = prices.get(prices.size() - 1);
        double predictedValue = regression.predict(prices.size());
        int predictedPrice = (int) Math.round(predictedValue);

        // 4. 결과 세팅
        result.setCurrentPrice(currentPrice);
        result.setPredictedPrice(predictedPrice);

        if (predictedPrice > currentPrice) {
            result.setTrend("UP");
        } else if (predictedPrice < currentPrice) {
            result.setTrend("DOWN");
        } else {
            result.setTrend("HOLD");
        }

        return result;
    }
}