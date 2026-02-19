package dev.j2m2n.backendserver.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
    private String titleIcon;

    private List<StatDto> stats;
    private List<EquipmentDto> equipment;
    private List<GemDto> gems;
    private List<CardDto> cards;
    private List<CardEffectDto> cardEffects;
    private List<SkillDto> skills;
    private ArkPassiveDto arkPassive;
    private List<ArkGridEffectDto> arkGridEffects; // [추가] 아크 그리드 (T4 각인)

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StatDto {
        private String type;
        private String value;
        private String tooltip;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EquipmentDto {
        private String type;
        private String name;
        private String icon;
        private String grade;
        private String tooltip;
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
        private String skillIcon;
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
        private List<ArkPassivePointDto> points;
        private List<ArkPassiveEffectDto> effects;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ArkPassivePointDto {
        private String name;
        private int value;
        private int rank;
        private int level;
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

    // ▼▼▼ [추가] 아크 그리드 DTO ▼▼▼
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ArkGridEffectDto {
        private String name;
        private String description;
        private int level;
        private String grade;
    }
}