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
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==========================================
    // 1. 캐릭터 정보 조회 (JsonNode + 크롤링 혼합)
    // ==========================================

    // 아크 그리드는 아직 API 지원을 안 하므로 크롤링 유지 (단, 공식 사이트 구조 변경 시 깨질 수 있음)
    private List<LostArkCharacterDto.ArkGridDto> scrapeArkGrid(String characterName) {
        List<LostArkCharacterDto.ArkGridDto> list = new ArrayList<>();
        try {
            String urlStr = "https://lostark.game.onstove.com/Profile/Character/" + URLEncoder.encode(characterName, "UTF-8");
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(urlStr, HttpMethod.GET, entity, String.class);
            String html = response.getBody();
            if (html == null) return list;

            String[] coreTypes = {"질서의 해 코어", "질서의 달 코어", "질서의 별 코어", "혼돈의 해 코어", "혼돈의 달 코어", "혼돈의 별 코어", "생명의 해 코어", "생명의 달 코어", "생명의 별 코어"};
            String[] icons = {
                    "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_96.png", "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_97.png", "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_98.png",
                    "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_99.png", "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_100.png", "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_101.png",
                    "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_102.png", "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_103.png", "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_104.png"
            };

            for (int i = 0; i < coreTypes.length; i++) {
                int idx = html.indexOf(coreTypes[i]);
                if (idx != -1) {
                    int start = Math.max(0, idx - 1000);
                    int end = Math.min(html.length(), idx + 1000);
                    String chunk = html.substring(start, end);

                    String effectName = "알 수 없음";
                    Matcher nm = Pattern.compile("NameTagBox.*?value.*?<P ALIGN='CENTER'><FONT COLOR='#[^>]+'>([^<]+)</FONT></P>").matcher(chunk);
                    if (nm.find()) effectName = nm.group(1).trim();

                    int points = 0;
                    Matcher pm = Pattern.compile(">(\\d+)P<").matcher(chunk);
                    if (pm.find()) points = Integer.parseInt(pm.group(1));

                    // 수정된 DTO에 맞춰 툴팁과 보석 리스트는 빈 값으로 처리하여 크롤링 결과 삽입
                    list.add(new LostArkCharacterDto.ArkGridDto(coreTypes[i], effectName, points, icons[i], "", new ArrayList<>()));
                }
            }
        } catch (Exception e) {
            log.error("아크 그리드 크롤링 에러: {}", e.getMessage());
        }
        return list;
    }

    public LostArkCharacterDto getCharacterInfo(String characterName) {
        try {
            // [원복] 완벽하게 작동했던 기존 헤더 및 엔티티 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(headers);

            // [원복] 완벽하게 작동했던 기존 URL 인코딩 로직 (%2B 사용)
            String encodedName = URLEncoder.encode(characterName, StandardCharsets.UTF_8.toString());
            // API 필터 추가 (ArkPassive, ArkGrid 포함)
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

            // 기존 코드에서 가져오던 CombatPower가 DTO에 있다면 추가 (없으면 주석 처리)
            // dto.setCombatPower(profile.path("CombatPower").asText(null));

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
                // 툴팁 필드 포함
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

                // DTO에 title 필드가 없다면 아래 줄은 주석 처리 또는 DTO 수정 필요
                // arkPassive.setTitle(arkRaw.path("Title").asText(null));

                List<LostArkCharacterDto.ArkPassivePointDto> points = new ArrayList<>();
                arkRaw.path("Points").forEach(p -> {
                    String desc = p.path("Description").asText("");
                    int rank = 0, level = 0;
                    Matcher rm = Pattern.compile("(\\d+)랭크").matcher(desc); if (rm.find()) rank = Integer.parseInt(rm.group(1));
                    Matcher lm = Pattern.compile("(\\d+)레벨").matcher(desc); if (lm.find()) level = Integer.parseInt(lm.group(1));

                    // 툴팁 필드 포함 생성자 (DTO에 맞춰 수정)
                    points.add(new LostArkCharacterDto.ArkPassivePointDto(p.path("Name").asText(""), p.path("Value").asInt(0), rank, level, p.path("Tooltip").asText("")));
                });
                arkPassive.setPoints(points);

                List<LostArkCharacterDto.ArkPassiveEffectDto> effects = new ArrayList<>();
                arkRaw.path("Effects").forEach(e -> {
                    // 툴팁 필드 포함 생성자 (DTO에 맞춰 수정)
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

            // Ark Grids (크롤링 병행)
            List<LostArkCharacterDto.ArkGridDto> arkGrids = new ArrayList<>();
            JsonNode arkGridRaw = root.path("ArkGrid");

            // API에서 아크그리드를 지원하는 경우 우선 파싱
            if (!arkGridRaw.isMissingNode() && arkGridRaw.has("Slots")) {
                arkGridRaw.path("Slots").forEach(slot -> {
                    String fullName = slot.path("Name").asText("");
                    String icon = slot.path("Icon").asText("");
                    int point = slot.path("Point").asInt(0);
                    String tooltip = slot.path("Tooltip").asText("");

                    String coreType = fullName;
                    String effectName = "알 수 없음";

                    if (fullName.contains(" : ")) {
                        String[] parts = fullName.split(" : ", 2);
                        coreType = parts[0].trim();
                        effectName = parts[1].trim();
                    }
                    arkGrids.add(new LostArkCharacterDto.ArkGridDto(coreType, effectName, point, icon, tooltip, new ArrayList<>()));
                });
            } else {
                // API 데이터가 없으면 크롤링으로 대체
                arkGrids.addAll(scrapeArkGrid(characterName)); // Use addAll instead of assignment to avoid lambda error
            }
            dto.setArkGrids(arkGrids);

            return dto;
        } catch (Exception e) {
            log.error("캐릭터 정보 조회 실패: {}", e.getMessage(), e);
            return null;
        }
    }


    // ==========================================
    // 2. 거래소/경매장 정보 검색 (기존 작동하던 Map 로직 원복)
    // ==========================================

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

                // 배틀 아이템(60000번대)은 전일 평균가 기준 내림차순(DESC)
                if (categoryCode / 10000 == 6) {
                    body.put("Sort", "YDAY_AVG_PRICE");
                    body.put("SortCondition", "DESC");
                } else {
                    body.put("Sort", "CURRENT_MIN_PRICE");
                    body.put("SortCondition", "DESC");
                }

                // API 호출 시 정렬은 기본값(최저가순)으로 요청하고, 서비스 단에서 재정렬하도록 변경
                body.put("Sort", "CURRENT_MIN_PRICE");
                body.put("SortCondition", "DESC");

                body.put("CategoryCode", categoryCode);

                // 생활(90000), 각인서(40000), 배틀아이템(60000~)은 티어 필터 제외
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

                if (rawItems == null || rawItems.isEmpty()) {
                    break;
                }

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
        final int MAX_PAGES = 5; // 보석은 매물이 많을 수 있으니 적당히 제한

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            while (pageNo <= MAX_PAGES) {
                Map<String, Object> body = new HashMap<>();
                body.put("Sort", "BUY_PRICE"); // 즉시 구매가 기준
                body.put("SortCondition", "ASC"); // 싼 순서 (최저가)
                body.put("CategoryCode", categoryCode);
                body.put("ItemTier", tier != null ? tier : 3);
                body.put("PageNo", pageNo);

                // itemName이 null이거나 "전체"인 경우, 보석(210000)은 "보석"이라는 키워드로 검색해야 전체 조회가 됨
                if (itemName != null && !itemName.isEmpty() && !itemName.equals("전체")) {
                    body.put("ItemName", itemName);
                } else if (categoryCode == 210000) {
                    body.put("ItemName", "보석");
                }

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(AUCTION_API_URL, request, Map.class);

                if (response.getBody() == null || !response.getBody().containsKey("Items")) {
                    break;
                }

                List<Map<String, Object>> rawItems = (List<Map<String, Object>>) response.getBody().get("Items");

                if (rawItems == null || rawItems.isEmpty()) {
                    break;
                }

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

    // ==========================================
    // 3. 내부 변환 유틸 메서드
    // ==========================================

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

        return new LostArkMarketItemDto(
                UUID.randomUUID().toString(),
                name,
                grade,
                bundle,
                minPrice,
                recentPrice,
                (int) avgPrice,
                changeRate,
                iconUrl
        );
    }

    private LostArkMarketItemDto convertAuctionToDto(Map<String, Object> raw) {
        String name = (String) raw.get("Name");
        String grade = (String) raw.get("Grade");
        String iconUrl = (String) raw.get("Icon");

        Map<String, Object> auctionInfo = (Map<String, Object>) raw.get("AuctionInfo");
        int minPrice = 0;
        int startPrice = 0;

        if (auctionInfo != null) {
            Object buyPriceObj = auctionInfo.get("BuyPrice");
            Object startPriceObj = auctionInfo.get("StartPrice");

            minPrice = buyPriceObj != null ? (int) buyPriceObj : 0;
            startPrice = startPriceObj != null ? (int) startPriceObj : 0;

            if (minPrice == 0) minPrice = startPrice;
        }

        return new LostArkMarketItemDto(
                UUID.randomUUID().toString(),
                name,
                grade,
                1,
                minPrice,
                0,
                0,
                0,
                iconUrl
        );
    }
}