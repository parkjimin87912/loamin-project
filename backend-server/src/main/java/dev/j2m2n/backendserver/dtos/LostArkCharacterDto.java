package dev.j2m2n.backendserver.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LostArkCharacterDto {
    private String serverName;
    private String characterName;
    private int characterLevel;
    private String characterClassName;
    private String itemAvgLevel;
    private String itemMaxLevel;
    
    // 추가 정보 (필요 시 확장)
    private List<EquipmentDto> equipment;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EquipmentDto {
        private String type;
        private String name;
        private String icon;
        private String grade;
    }
}