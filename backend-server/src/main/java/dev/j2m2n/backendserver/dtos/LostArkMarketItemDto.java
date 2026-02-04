package dev.j2m2n.backendserver.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LostArkMarketItemDto {
    private String id;
    private String name;
    private String grade;
    private int bundle;
    private int minPrice;
    private int recentPrice;
    private int avgPrice;
    private double changeRate;
    private String icon;
}