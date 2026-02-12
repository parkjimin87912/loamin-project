package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.LostArkCharacterDto;
import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

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

    public List<LostArkMarketItemDto> searchItems(int categoryCode, String itemName, Integer tier, String grade) {
        List<LostArkMarketItemDto> allItems = new ArrayList<>();
        int pageNo = 1;
        final int MAX_PAGES = 5;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            while (pageNo <= MAX_PAGES) {
                Map<String, Object> body = new HashMap<>();
                body.put("Sort", "CURRENT_MIN_PRICE");
                body.put("SortCondition", "DESC"); // DESC 기억
                body.put("CategoryCode", categoryCode);

                if (categoryCode != 90000 && categoryCode != 40000 && categoryCode / 10000 != 6) {
                    body.put("ItemTier", tier != null ? tier : 3);
                }

                if (grade != null && !grade.isEmpty()) {
                    body.put("ItemGrade", grade);
                }

                body.put("PageNo", pageNo);

                if (itemName != null && !itemName.isEmpty() && !itemName.equals("전체")) {
                    body.put("ItemName", itemName);
                }

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(MARKET_API_URL, request, Map.class);

                if (response.getBody() == null || !response.getBody().containsKey("Items")) {
                    break;
                }

                List<Map<String, Object>> rawItems = (List<Map<String, Object>>) response.getBody().get("Items");
                if (rawItems == null || rawItems.isEmpty()) break;

                List<LostArkMarketItemDto> pageItems = rawItems.stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList());
                allItems.addAll(pageItems);
                pageNo++;
            }
        } catch (Exception e) {
            log.error("로스트아크 거래소 API 호출 실패: {}", e.getMessage());
        }
        return allItems;
    }

    public List<LostArkMarketItemDto> searchAuctionItems(int categoryCode, String itemName, Integer tier) {
        List<LostArkMarketItemDto> allItems = new ArrayList<>();
        int pageNo = 1;
        final int MAX_PAGES = 5;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            while (pageNo <= MAX_PAGES) {
                Map<String, Object> body = new HashMap<>();
                body.put("Sort", "BUY_PRICE");
                body.put("SortCondition", "ASC");
                body.put("CategoryCode", categoryCode);
                body.put("ItemTier", tier != null ? tier : 3);
                body.put("PageNo", pageNo);

                if (itemName != null && !itemName.isEmpty() && !itemName.equals("전체")) {
                    body.put("ItemName", itemName);
                } else if (categoryCode == 210000) {
                    body.put("ItemName", "보석");
                }

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(AUCTION_API_URL, request, Map.class);

                if (response.getBody() == null || !response.getBody().containsKey("Items")) break;

                List<Map<String, Object>> rawItems = (List<Map<String, Object>>) response.getBody().get("Items");
                if (rawItems == null || rawItems.isEmpty()) break;

                List<LostArkMarketItemDto> pageItems = rawItems.stream()
                        .map(this::convertAuctionToDto)
                        .collect(Collectors.toList());
                allItems.addAll(pageItems);
                pageNo++;
            }
        } catch (Exception e) {
            log.error("로스트아크 경매장 API 호출 실패: {}", e.getMessage());
        }
        return allItems;
    }

    public LostArkCharacterDto getCharacterInfo(String characterName) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(headers);

            String encodedName = URLEncoder.encode(characterName, StandardCharsets.UTF_8.toString());
            String filters = "profiles%2Bequipment%2Bcombat-skills%2Bengravings%2Bcards%2Bgems%2Barkpassive";
            String urlStr = CHARACTER_API_URL + "/" + encodedName + "?filters=" + filters;

            URI uri = URI.create(urlStr);
            log.info("Requesting Character Info URI: {}", uri);

            ResponseEntity<Map> response = restTemplate.exchange(uri, org.springframework.http.HttpMethod.GET, request, Map.class);

            if (response.getBody() == null) return null;

            Map<String, Object> body = response.getBody();

            // 1. 프로필
            Map<String, Object> profile = (Map<String, Object>) body.get("ArmoryProfile");
            if (profile == null) return null;

            String serverName = (String) profile.get("ServerName");
            int level = getInt(profile, "CharacterLevel");
            String className = (String) profile.get("CharacterClassName");
            String itemAvgLevel = (String) profile.get("ItemAvgLevel");
            String itemMaxLevel = (String) profile.get("ItemMaxLevel");
            String characterImage = (String) profile.get("CharacterImage");
            String guildName = (String) profile.get("GuildName");

            String rawTitle = (String) profile.get("Title");
            String title = rawTitle != null ? rawTitle.replaceAll("<[^>]*>", "").trim() : "";

            String titleIcon = null;
            try {
                Map<String, Object> decorations = (Map<String, Object>) profile.get("Decorations");
                if (decorations != null) {
                    List<String> emblems = (List<String>) decorations.get("Emblems");
                    if (emblems != null && !emblems.isEmpty()) {
                        titleIcon = emblems.get(0);
                    }
                }
            } catch (Exception e) { log.warn("엠블럼 파싱 실패", e); }

            // 스탯
            List<LostArkCharacterDto.StatDto> stats = new ArrayList<>();
            try {
                List<Map<String, Object>> statsRaw = (List<Map<String, Object>>) profile.get("Stats");
                if (statsRaw != null) {
                    for (Map<String, Object> s : statsRaw) {
                        stats.add(new LostArkCharacterDto.StatDto(
                                (String) s.get("Type"),
                                (String) s.get("Value"),
                                (String) ((List) s.get("Tooltip")).get(0)
                        ));
                    }
                }
            } catch (Exception e) { log.warn("스탯 파싱 실패", e); }

            // 2. 장비
            List<LostArkCharacterDto.EquipmentDto> equipmentList = new ArrayList<>();
            try {
                List<Map<String, Object>> equipmentRaw = (List<Map<String, Object>>) body.get("ArmoryEquipment");
                if (equipmentRaw != null) {
                    for (Map<String, Object> eq : equipmentRaw) {
                        equipmentList.add(new LostArkCharacterDto.EquipmentDto(
                                (String) eq.get("Type"),
                                (String) eq.get("Name"),
                                (String) eq.get("Icon"),
                                (String) eq.get("Grade"),
                                (String) eq.get("Tooltip")
                        ));
                    }
                }
            } catch (Exception e) { log.warn("장비 파싱 실패", e); }

            // 3. 보석 (Effects 파싱 추가)
            List<LostArkCharacterDto.GemDto> gems = new ArrayList<>();
            try {
                Map<String, Object> gemsRaw = (Map<String, Object>) body.get("ArmoryGem");
                if (gemsRaw != null) {
                    // [중요] 보석 효과(Effects)에서 정확한 스킬 아이콘 맵핑 생성
                    Map<Integer, String> gemSkillIconMap = new HashMap<>();
                    try {
                        Object effectsObj = gemsRaw.get("Effects");
                        if (effectsObj instanceof Map) { // JSON 구조에 따라 Map 또는 List일 수 있음, 보통 구조상
                            // ArmoryGem -> Effects -> Skills (List)
                            // 로그를 보면 Effects={..., Skills=[...]} 형태임
                            Map<String, Object> effects = (Map<String, Object>) effectsObj;
                            List<Map<String, Object>> effectSkills = (List<Map<String, Object>>) effects.get("Skills");
                            if (effectSkills != null) {
                                for (Map<String, Object> es : effectSkills) {
                                    Integer slot = getInt(es, "GemSlot");
                                    String icon = (String) es.get("Icon");
                                    if (slot != 0 && icon != null) {
                                        gemSkillIconMap.put(slot, icon);
                                    }
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.warn("보석 효과(Effects) 파싱 실패", e);
                    }

                    List<Map<String, Object>> gemList = (List<Map<String, Object>>) gemsRaw.get("Gems");
                    if (gemList != null) {
                        for (Map<String, Object> g : gemList) {
                            int slot = getInt(g, "Slot");
                            String rawName = (String) g.get("Name");
                            String name = rawName != null ? rawName.replaceAll("<[^>]*>", "") : "";
                            String icon = (String) g.get("Icon");
                            int gemLevel = getInt(g, "Level");
                            String grade = (String) g.get("Grade");
                            String tooltip = (String) g.get("Tooltip");

                            // 맵에서 스킬 아이콘 가져오기
                            String skillIcon = gemSkillIconMap.get(slot);

                            gems.add(new LostArkCharacterDto.GemDto(slot, name, icon, gemLevel, grade, tooltip, skillIcon));
                        }
                    }
                }
                // 보석 정렬 로직 (기존과 동일)
                gems.sort((g1, g2) -> {
                    boolean isDmg1 = g1.getName().contains("멸화") || g1.getName().contains("겁화") || (g1.getName().contains("광휘") && g1.getTooltip().contains("피해"));
                    boolean isDmg2 = g2.getName().contains("멸화") || g2.getName().contains("겁화") || (g2.getName().contains("광휘") && g2.getTooltip().contains("피해"));
                    boolean isCd1 = g1.getName().contains("홍염") || g1.getName().contains("작열") || (g1.getName().contains("광휘") && g1.getTooltip().contains("재사용 대기시간"));
                    boolean isCd2 = g2.getName().contains("홍염") || g2.getName().contains("작열") || (g2.getName().contains("광휘") && g2.getTooltip().contains("재사용 대기시간"));
                    int type1 = isDmg1 ? 1 : (isCd1 ? 2 : 3);
                    int type2 = isDmg2 ? 1 : (isCd2 ? 2 : 3);
                    if (type1 != type2) return type1 - type2;
                    return Integer.compare(g2.getLevel(), g1.getLevel());
                });
            } catch (Exception e) { log.warn("보석 파싱 실패", e); }

            // 4. 카드
            List<LostArkCharacterDto.CardDto> cards = new ArrayList<>();
            List<LostArkCharacterDto.CardEffectDto> cardEffects = new ArrayList<>();
            try {
                Map<String, Object> cardsRaw = (Map<String, Object>) body.get("ArmoryCard");
                if (cardsRaw != null) {
                    List<Map<String, Object>> cardList = (List<Map<String, Object>>) cardsRaw.get("Cards");
                    if (cardList != null) {
                        for (Map<String, Object> c : cardList) {
                            cards.add(new LostArkCharacterDto.CardDto(
                                    getInt(c, "Slot"),
                                    (String) c.get("Name"),
                                    (String) c.get("Icon"),
                                    getInt(c, "AwakeCount"),
                                    (String) c.get("Grade")
                            ));
                        }
                    }
                    List<Map<String, Object>> effectList = (List<Map<String, Object>>) cardsRaw.get("Effects");
                    if (effectList != null) {
                        for (Map<String, Object> e : effectList) {
                            List<Map<String, Object>> itemsRaw = (List<Map<String, Object>>) e.get("Items");
                            List<LostArkCharacterDto.ItemDto> items = new ArrayList<>();
                            if (itemsRaw != null) {
                                for (Map<String, Object> i : itemsRaw) {
                                    items.add(new LostArkCharacterDto.ItemDto((String) i.get("Name"), (String) i.get("Description")));
                                }
                            }
                            cardEffects.add(new LostArkCharacterDto.CardEffectDto(getInt(e, "Index"), (List<Integer>) e.get("CardSlots"), items));
                        }
                    }
                }
            } catch (Exception e) { log.warn("카드 파싱 실패", e); }

            // 5. 스킬 (필터링 제거!)
            List<LostArkCharacterDto.SkillDto> skills = new ArrayList<>();
            try {
                List<Map<String, Object>> skillsRaw = (List<Map<String, Object>>) body.get("ArmorySkills");
                if (skillsRaw != null) {
                    for (Map<String, Object> s : skillsRaw) {
                        String name = (String) s.get("Name");
                        String icon = (String) s.get("Icon");
                        int skillLevel = getInt(s, "Level");
                        String type = (String) s.get("Type");
                        boolean isAwakening = getBoolean(s, "IsAwakening");

                        List<LostArkCharacterDto.TripodDto> tripods = new ArrayList<>();
                        List<Map<String, Object>> tripodsRaw = (List<Map<String, Object>>) s.get("Tripods");
                        if (tripodsRaw != null) {
                            for (Map<String, Object> t : tripodsRaw) {
                                if (getBoolean(t, "IsSelected")) {
                                    tripods.add(new LostArkCharacterDto.TripodDto(getInt(t, "Tier"), getInt(t, "Slot"), (String) t.get("Name"), (String) t.get("Icon"), getInt(t, "Level"), true));
                                }
                            }
                        }

                        String runeName = null; String runeIcon = null; String runeGrade = null;
                        Map<String, Object> runeRaw = (Map<String, Object>) s.get("Rune");
                        if (runeRaw != null) {
                            runeName = (String) runeRaw.get("Name");
                            runeIcon = (String) runeRaw.get("Icon");
                            runeGrade = (String) runeRaw.get("Grade");
                        }

                        // [중요] 필터링 로직 제거: 1레벨 스킬도 모두 리턴
                        skills.add(new LostArkCharacterDto.SkillDto(name, icon, skillLevel, type, isAwakening, tripods, runeName, runeIcon, runeGrade));
                    }
                }
            } catch (Exception e) { log.warn("스킬 파싱 실패", e); }

            // 6. 아크패시브
            LostArkCharacterDto.ArkPassiveDto arkPassive = new LostArkCharacterDto.ArkPassiveDto(false, new ArrayList<>());
            try {
                Map<String, Object> arkPassiveRaw = (Map<String, Object>) body.get("ArmoryArkPassive");
                if (arkPassiveRaw != null) {
                    arkPassive.setArkPassive(getBoolean(arkPassiveRaw, "IsArkPassive"));
                    List<Map<String, Object>> effectsRaw = (List<Map<String, Object>>) arkPassiveRaw.get("Effects");
                    if (effectsRaw != null) {
                        List<LostArkCharacterDto.ArkPassiveEffectDto> effects = new ArrayList<>();
                        for (Map<String, Object> eff : effectsRaw) {
                            String desc = (String) eff.get("Description");
                            if (desc != null) desc = desc.replaceAll("<[^>]*>", " ");
                            effects.add(new LostArkCharacterDto.ArkPassiveEffectDto((String) eff.get("Name"), desc, (String) eff.get("Icon"), (String) eff.get("Grade")));
                        }
                        arkPassive.setEffects(effects);
                    }
                }
            } catch (Exception e) { log.warn("아크패시브 파싱 실패", e); }

            return new LostArkCharacterDto(serverName, characterName, level, className, itemAvgLevel, itemMaxLevel, characterImage, guildName, title, titleIcon, stats, equipmentList, gems, cards, cardEffects, skills, arkPassive);

        } catch (Exception e) {
            log.error("로스트아크 캐릭터 API 호출 실패: {}", e.getMessage());
            return null;
        }
    }

    // ... (convertDto 메서드들 기존과 동일) ...
    private LostArkMarketItemDto convertToDto(Map<String, Object> raw) {
        String name = (String) raw.get("Name");
        String grade = (String) raw.get("Grade");
        String iconUrl = (String) raw.get("Icon");
        int bundle = (int) raw.get("BundleCount");
        int minPrice = (int) raw.get("CurrentMinPrice");
        int recentPrice = (int) raw.get("RecentPrice");
        double avgPrice = ((Number) raw.get("YDayAvgPrice")).doubleValue();

        double changeRate = 0;
        if (avgPrice > 0) {
            changeRate = ((minPrice - avgPrice) / avgPrice) * 100;
            changeRate = Math.round(changeRate * 10.0) / 10.0;
        }

        return new LostArkMarketItemDto(UUID.randomUUID().toString(), name, grade, bundle, minPrice, recentPrice, (int) avgPrice, changeRate, iconUrl);
    }

    private LostArkMarketItemDto convertAuctionToDto(Map<String, Object> raw) {
        String name = (String) raw.get("Name");
        String grade = (String) raw.get("Grade");
        String iconUrl = (String) raw.get("Icon");
        Map<String, Object> auctionInfo = (Map<String, Object>) raw.get("AuctionInfo");
        int minPrice = 0;
        if (auctionInfo != null) {
            Object buyPriceObj = auctionInfo.get("BuyPrice");
            Object startPriceObj = auctionInfo.get("StartPrice");
            minPrice = buyPriceObj != null ? (int) buyPriceObj : 0;
            if (minPrice == 0 && startPriceObj != null) minPrice = (int) startPriceObj;
        }
        return new LostArkMarketItemDto(UUID.randomUUID().toString(), name, grade, 1, minPrice, 0, 0, 0, iconUrl);
    }

    private int getInt(Map<String, Object> map, String key) {
        if (map == null) return 0;
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).intValue();
        return 0;
    }

    private boolean getBoolean(Map<String, Object> map, String key) {
        if (map == null) return false;
        Object val = map.get(key);
        if (val instanceof Boolean) return (Boolean) val;
        return false;
    }
}