package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.PredictionDto;
import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PredictionService {

    /**
     * 단순 선형 회귀(Linear Regression)를 사용한 다음 가격 예측
     */
    public PredictionDto predictNextPrice(List<Integer> prices) {
        PredictionDto result = new PredictionDto();

        // 데이터가 없거나 1개뿐이면 예측 불가 -> 현재 가격 그대로 반환
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