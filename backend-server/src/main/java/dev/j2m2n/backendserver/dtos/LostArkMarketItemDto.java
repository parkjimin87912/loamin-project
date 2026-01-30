package dev.j2m2n.backendserver.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class LostArkMarketItemDto {
    // 로스트아크 API의 JSON 키값과 정확히 일치해야 합니다.
    @JsonProperty("Name")
    private String name;

    @JsonProperty("Grade")
    private String grade;

    @JsonProperty("YDayAvgPrice")
    private Double yDayAvgPrice;

    @JsonProperty("CurrentMinPrice")
    private Integer currentMinPrice;

    @JsonProperty("TradeCount")
    private Integer tradeCount;
}