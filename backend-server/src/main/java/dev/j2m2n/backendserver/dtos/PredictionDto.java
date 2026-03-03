package dev.j2m2n.backendserver.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PredictionDto {
    private Integer currentPrice;
    private Integer predictedPrice;
    private String trend; // "UP", "DOWN", "HOLD"
}