package dev.j2m2n.backendserver.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LostArkCharacterDto {
    // 기본 프로필
    private String serverName;
    private String characterName;
    private int characterLevel;
    private String characterClassName;
    private String itemAvgLevel;
    private String itemMaxLevel;
    private String characterImage;
    private String guildName;
    private String title;
    
    // 기본 스탯 (공격력, 체력, 치명, 신속 등)
    private List<StatDto> stats;

    // 장비 (무기, 방어구, 악세서리, 어빌리티 스톤, 팔찌, 나침반, 부적 등)
    private List<EquipmentDto> equipment;
    
    // 보석
    private List<GemDto> gems;
    
    // 카드
    private List<CardDto> cards;
    private List<CardEffectDto> cardEffects;
    
    // 스킬
    private List<SkillDto> skills;
    
    // 아크패시브 (구조가 복잡할 수 있으므로 유연하게 처리하거나 주요 필드만 매핑)
    private ArkPassiveDto arkPassive;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StatDto {
        private String type;
        private String value;
        private String tooltip; // 세부 정보
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EquipmentDto {
        private String type;
        private String name;
        private String icon;
        private String grade;
        private String tooltip; // 세부 옵션 파싱용 (JSON 문자열)
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GemDto {
        private int slot;
        private String name;
        private String icon;
        private int level;
        private String grade;
        private String tooltip;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CardDto {
        private int slot;
        private String name;
        private String icon;
        private int awakeCount;
        private String grade;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CardEffectDto {
        private int index;
        private List<Integer> cardSlots;
        private List<ItemDto> items;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemDto {
        private String name;
        private String description;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SkillDto {
        private String name;
        private String icon;
        private int level;
        private String type;
        private boolean isAwakening;
        private List<TripodDto> tripods;
        private String runeName;
        private String runeIcon;
        private String runeGrade;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TripodDto {
        private int tier;
        private int slot;
        private String name;
        private String icon;
        private int level;
        private boolean isSelected;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ArkPassiveDto {
        private boolean isArkPassive;
        private List<ArkPassiveEffectDto> effects;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ArkPassiveEffectDto {
        private String name;
        private String description;
        private String icon;
        private String grade;
    }
}