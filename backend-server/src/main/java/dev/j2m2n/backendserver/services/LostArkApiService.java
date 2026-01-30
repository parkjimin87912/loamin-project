package dev.j2m2n.backendserver.services;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import dev.j2m2n.backendserver.dtos.LostArkMarketResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LostArkApiService {

    @Value("${lostark.api.key}")
    private String apiKey;

    @Value("${lostark.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<LostArkMarketItemDto> getMarketItems(int categoryCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "bearer " + apiKey);
        headers.set("Content-Type", "application/json");

        // [수정] "전설" -> "유물"로 변경
        String requestBody = """
            {
                "Sort": "CURRENT_MIN_PRICE",
                "CategoryCode": %d,
                "ItemGrade": "유물",
                "PageNo": 1,
                "SortCondition": "DESC"
            }
            """.formatted(categoryCode);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<LostArkMarketResponseDto> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    LostArkMarketResponseDto.class
            );

            if (response.getBody() != null && response.getBody().getItems() != null) {
                log.info("로스트아크 API 호출 성공 (유물 등급): {}개 아이템 수신", response.getBody().getItems().size());
                return response.getBody().getItems();
            }
        } catch (Exception e) {
            log.error("로스트아크 API 호출 중 에러 발생: ", e);
        }

        return Collections.emptyList();
    }
}