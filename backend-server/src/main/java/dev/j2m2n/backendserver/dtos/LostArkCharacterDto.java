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
public class LostArkCharacterDto {
    private String serverName;
    private String characterName;
    private int characterLevel;
    private String characterClassName;
    private String itemAvgLevel;
    private String itemMaxLevel;
    private String combatPower;
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

    private List<T4EngravingDto> t4Engravings;
    private List<ArkGridDto> arkGrids;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StatDto {
        private String type;
        private String value;
        private String tooltip;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
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
    @JsonIgnoreProperties(ignoreUnknown = true)
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
    @JsonIgnoreProperties(ignoreUnknown = true)
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CardEffectDto {
        private int index;
        private List<Integer> cardSlots;
        private List<ItemDto> items;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ItemDto {
        private String name;
        private String description;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
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
        private String tooltip; // 🌟 툴팁 필드 추가
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ArkPassiveDto {
        private boolean isArkPassive;
        private String title;
        private List<ArkPassivePointDto> points;
        private List<ArkPassiveEffectDto> effects;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ArkPassivePointDto {
        private String name;
        private int value;
        private int rank;
        private int level;
        private String tooltip; // 🌟 툴팁 필드 추가
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ArkPassiveEffectDto {
        private String name;
        private String description;
        private String icon;
        private String grade;
        private String tooltip; // 🌟 툴팁 필드 추가
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class T4EngravingDto {
        private String name;
        private String description;
        private int level;
        private String grade;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ArkGridDto {
        private String coreType;
        private String effectName;
        private int point;
        private String icon;
    }
}