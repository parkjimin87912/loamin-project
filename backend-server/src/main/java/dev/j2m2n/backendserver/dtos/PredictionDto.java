package dev.j2m2n.backendserver.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PredictionDto {
    @JsonProperty("current_price")
    private Integer currentPrice;

    @JsonProperty("predicted_price")
    private Integer predictedPrice;

    private String trend; // "UP", "DOWN", "HOLD"
}