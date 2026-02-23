package dev.j2m2n.backendserver.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.j2m2n.backendserver.dtos.LostArkCharacterDto;
import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class LostArkApiService {

    @Value("${lostark.api.key}")
    private String apiKey;

    private static final String MARKET_API_URL = "https://developer-lostark.game.onstove.com/markets/items";
    private static final String AUCTION_API_URL = "https://developer-lostark.game.onstove.com/auctions/items";
    private static final String CHARACTER_API_URL = "https://developer-lostark.game.onstove.com/armories/characters";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LostArkCharacterDto getCharacterInfo(String characterName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(headers);

            String encodedName = URLEncoder.encode(characterName, StandardCharsets.UTF_8.toString());
            // API 필터에 ArkGrid 추가
            String filters = "profiles%2Bequipment%2Bcombat-skills%2Bengravings%2Bcards%2Bgems%2BArkPassive%2BArkGrid";
            String urlStr = CHARACTER_API_URL + "/" + encodedName + "?filters=" + filters;
            URI uri = URI.create(urlStr);

            // API 호출
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, request, String.class);
            if (response.getBody() == null) return null;

            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.isNull() || root.path("ArmoryProfile").isNull()) return null;

            LostArkCharacterDto dto = new LostArkCharacterDto();
            dto.setCharacterName(characterName);

            // Profile
            JsonNode profile = root.path("ArmoryProfile");
            dto.setServerName(profile.path("ServerName").asText(null));
            dto.setCharacterLevel(profile.path("CharacterLevel").asInt(0));
            dto.setCharacterClassName(profile.path("CharacterClassName").asText(null));
            dto.setItemAvgLevel(profile.path("ItemAvgLevel").asText(null));
            dto.setItemMaxLevel(profile.path("ItemMaxLevel").asText(null));
            dto.setCombatPower(profile.path("CombatPower").asText(null));
            dto.setCharacterImage(profile.path("CharacterImage").asText(null));
            dto.setGuildName(profile.path("GuildName").asText(null));
            dto.setTitle(profile.path("Title").asText("").replaceAll("<[^>]*>", "").trim());

            try {
                JsonNode emblems = profile.path("Decorations").path("Emblems");
                if (emblems.isArray() && emblems.size() > 0) dto.setTitleIcon(emblems.get(0).asText(null));
            } catch (Exception ignored) {}

            // Stats
            List<LostArkCharacterDto.StatDto> stats = new ArrayList<>();
            profile.path("Stats").forEach(s -> {
                String tooltip = s.path("Tooltip").isArray() && s.path("Tooltip").size() > 0 ? s.path("Tooltip").get(0).asText("") : "";
                stats.add(new LostArkCharacterDto.StatDto(s.path("Type").asText(""), s.path("Value").asText(""), tooltip));
            });
            dto.setStats(stats);

            // Equipment
            List<LostArkCharacterDto.EquipmentDto> equipment = new ArrayList<>();
            root.path("ArmoryEquipment").forEach(eq -> {
                equipment.add(new LostArkCharacterDto.EquipmentDto(eq.path("Type").asText(""), eq.path("Name").asText(""), eq.path("Icon").asText(""), eq.path("Grade").asText(""), eq.path("Tooltip").asText("")));
            });
            dto.setEquipment(equipment);

            // Gems
            List<LostArkCharacterDto.GemDto> gems = new ArrayList<>();
            JsonNode gemsRaw = root.path("ArmoryGem");
            Map<Integer, String> gemSkillMap = new HashMap<>();
            gemsRaw.path("Effects").path("Skills").forEach(skill -> {
                int slot = skill.path("GemSlot").asInt(0);
                if (slot != 0) gemSkillMap.put(slot, skill.path("Icon").asText(null));
            });
            gemsRaw.path("Gems").forEach(g -> {
                int slot = g.path("Slot").asInt(0);
                gems.add(new LostArkCharacterDto.GemDto(slot, g.path("Name").asText("").replaceAll("<[^>]*>", ""), g.path("Icon").asText(""), g.path("Level").asInt(0), g.path("Grade").asText(""), g.path("Tooltip").asText(""), gemSkillMap.get(slot)));
            });
            dto.setGems(gems);

            // Cards
            List<LostArkCharacterDto.CardDto> cards = new ArrayList<>();
            List<LostArkCharacterDto.CardEffectDto> cardEffects = new ArrayList<>();
            JsonNode cardsRaw = root.path("ArmoryCard");
            cardsRaw.path("Cards").forEach(c -> cards.add(new LostArkCharacterDto.CardDto(c.path("Slot").asInt(0), c.path("Name").asText(""), c.path("Icon").asText(""), c.path("AwakeCount").asInt(0), c.path("Grade").asText(""))));
            cardsRaw.path("Effects").forEach(e -> {
                List<Integer> slots = new ArrayList<>();
                e.path("CardSlots").forEach(s -> slots.add(s.asInt()));
                List<LostArkCharacterDto.ItemDto> items = new ArrayList<>();
                e.path("Items").forEach(i -> items.add(new LostArkCharacterDto.ItemDto(i.path("Name").asText(""), i.path("Description").asText(""))));
                cardEffects.add(new LostArkCharacterDto.CardEffectDto(e.path("Index").asInt(0), slots, items));
            });
            dto.setCards(cards);
            dto.setCardEffects(cardEffects);

            // Skills
            List<LostArkCharacterDto.SkillDto> skills = new ArrayList<>();
            root.path("ArmorySkills").forEach(s -> {
                List<LostArkCharacterDto.TripodDto> tripods = new ArrayList<>();
                s.path("Tripods").forEach(t -> {
                    if (t.path("IsSelected").asBoolean(false)) {
                        tripods.add(new LostArkCharacterDto.TripodDto(t.path("Tier").asInt(0), t.path("Slot").asInt(0), t.path("Name").asText(""), t.path("Icon").asText(""), t.path("Level").asInt(0), true));
                    }
                });
                JsonNode rune = s.path("Rune");
                // 🌟 툴팁 필드 추가
                skills.add(new LostArkCharacterDto.SkillDto(s.path("Name").asText(""), s.path("Icon").asText(""), s.path("Level").asInt(0), s.path("Type").asText(""), s.path("IsAwakening").asBoolean(false), tripods, rune.path("Name").asText(null), rune.path("Icon").asText(null), rune.path("Grade").asText(null), s.path("Tooltip").asText("")));
            });
            dto.setSkills(skills);

            // ArkPassive
            LostArkCharacterDto.ArkPassiveDto arkPassive = new LostArkCharacterDto.ArkPassiveDto();
            arkPassive.setPoints(new ArrayList<>());
            arkPassive.setEffects(new ArrayList<>());

            JsonNode arkRaw = root.path("ArkPassive");
            if (!arkRaw.isMissingNode()) {
                arkPassive.setArkPassive(arkRaw.path("IsArkPassive").asBoolean(false));
                arkPassive.setTitle(arkRaw.path("Title").asText(null));

                List<LostArkCharacterDto.ArkPassivePointDto> points = new ArrayList<>();
                arkRaw.path("Points").forEach(p -> {
                    String desc = p.path("Description").asText("");
                    int rank = 0, level = 0;
                    Matcher rm = Pattern.compile("(\\d+)랭크").matcher(desc); if (rm.find()) rank = Integer.parseInt(rm.group(1));
                    Matcher lm = Pattern.compile("(\\d+)레벨").matcher(desc); if (lm.find()) level = Integer.parseInt(lm.group(1));
                    // 🌟 툴팁 필드 추가
                    points.add(new LostArkCharacterDto.ArkPassivePointDto(p.path("Name").asText(""), p.path("Value").asInt(0), rank, level, p.path("Tooltip").asText("")));
                });
                arkPassive.setPoints(points);

                List<LostArkCharacterDto.ArkPassiveEffectDto> effects = new ArrayList<>();
                arkRaw.path("Effects").forEach(e -> {
                    effects.add(new LostArkCharacterDto.ArkPassiveEffectDto(e.path("Name").asText(""), e.path("Description").asText(""), e.path("Icon").asText(""), e.path("Grade").asText(""), e.path("Tooltip").asText("")));
                });
                arkPassive.setEffects(effects);
            }
            dto.setArkPassive(arkPassive);

            // T4 Engravings
            List<LostArkCharacterDto.T4EngravingDto> t4Engravings = new ArrayList<>();
            root.path("ArmoryEngraving").path("ArkPassiveEffects").forEach(pe -> {
                t4Engravings.add(new LostArkCharacterDto.T4EngravingDto(pe.path("Name").asText(""), pe.path("Description").asText(""), pe.path("Level").asInt(0), pe.path("Grade").asText("")));
            });
            dto.setT4Engravings(t4Engravings);

            // Ark Grids
            List<LostArkCharacterDto.ArkGridDto> arkGrids = new ArrayList<>();
            List<LostArkCharacterDto.ArkGridEffectDto> arkGridEffects = new ArrayList<>(); // 🌟 아크 그리드 전체 효과 리스트

            JsonNode arkGridRaw = root.path("ArkGrid");
            if (!arkGridRaw.isMissingNode()) {
                if (arkGridRaw.has("Slots")) {
                    arkGridRaw.path("Slots").forEach(slot -> {
                        String fullName = slot.path("Name").asText(""); // ex: "질서의 해 코어 : 그라비티 코어"
                        String icon = slot.path("Icon").asText("");
                        int point = slot.path("Point").asInt(0);
                        String tooltip = slot.path("Tooltip").asText(""); // 🌟 툴팁 필드 추가

                        String coreType = fullName;
                        String effectName = "알 수 없음";

                        if (fullName.contains(" : ")) {
                            String[] parts = fullName.split(" : ", 2);
                            coreType = parts[0].trim();
                            effectName = parts[1].trim();
                        }

                        // 🌟 Gems 파싱 추가
                        List<LostArkCharacterDto.ArkGridGemDto> gemsList = new ArrayList<>();
                        if (slot.has("Gems")) {
                            slot.path("Gems").forEach(gem -> {
                                gemsList.add(new LostArkCharacterDto.ArkGridGemDto(
                                        gem.path("Index").asInt(0),
                                        gem.path("Icon").asText(""),
                                        gem.path("IsActive").asBoolean(false),
                                        gem.path("Grade").asText(""),
                                        gem.path("Tooltip").asText("")
                                ));
                            });
                        }

                        arkGrids.add(new LostArkCharacterDto.ArkGridDto(coreType, effectName, point, icon, tooltip, gemsList));
                    });
                }

                // 🌟 Effects 파싱 추가
                if (arkGridRaw.has("Effects")) {
                    arkGridRaw.path("Effects").forEach(effect -> {
                        arkGridEffects.add(new LostArkCharacterDto.ArkGridEffectDto(
                                effect.path("Name").asText(""),
                                effect.path("Level").asInt(0),
                                effect.path("Tooltip").asText("")
                        ));
                    });
                }
            }
            dto.setArkGrids(arkGrids);
            dto.setArkGridEffects(arkGridEffects); // 🌟 DTO에 설정

            return dto;
        } catch (Exception e) {
            log.error("캐릭터 정보 조회 실패: {}", e.getMessage(), e);
            return null;
        }
    }

    public List<LostArkMarketItemDto> searchItems(int categoryCode, String itemName, Integer tier, String grade) {
        return new ArrayList<>();
    }

    public List<LostArkMarketItemDto> searchAuctionItems(int categoryCode, String itemName, Integer tier) {
        return new ArrayList<>();
    }
}