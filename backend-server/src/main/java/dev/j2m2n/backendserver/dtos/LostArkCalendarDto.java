package dev.j2m2n.backendserver.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LostArkCalendarDto {
    private String categoryName;
    private String showName;
    private List<String> rewardItems;
    private String location;
    private List<String> startTimes;
    private String image;
    private int minItemLevel; // 🌟 추가
}