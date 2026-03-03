package dev.j2m2n.backendserver.configs;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
import dev.j2m2n.backendserver.entities.ItemMeta;
import dev.j2m2n.backendserver.entities.MarketPriceHistory;
import dev.j2m2n.backendserver.repositories.ItemMetaRepository;
import dev.j2m2n.backendserver.repositories.MarketPriceHistoryRepository;
import dev.j2m2n.backendserver.services.LostArkApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MarketDataBatchConfig {

    private final LostArkApiService lostArkApiService;
    private final MarketPriceHistoryRepository historyRepository;
    private final ItemMetaRepository itemMetaRepository;

    @Bean
    public Job marketDataJob(JobRepository jobRepository, Step fetchMarketDataStep) {
        return new JobBuilder("marketDataJob", jobRepository)
                .start(fetchMarketDataStep)
                .build();
    }

    @Bean
    public Step fetchMarketDataStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("fetchMarketDataStep", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    log.info(">>> 로스트아크 마켓 데이터 수집 시작 (3티어 & 4티어 싹 다 수집!)");
                    LocalDateTime now = LocalDateTime.now();
                    List<MarketPriceHistory> historiesToSave = new ArrayList<>();

                    // 🌟 싹 다 긁어오기 위해 수집할 티어를 배열로 지정
                    int[] targetTiers = {3, 4};

                    for (int tier : targetTiers) {
                        log.info(">>> [티어 {}] 재련 재료 수집 중...", tier);

                        // 1. 일반 재련 재료 (50010) 수집
                        List<LostArkMarketItemDto> items = lostArkApiService.searchItems(50010, null, tier, null);
                        for (LostArkMarketItemDto itemDto : items) {
                            ItemMeta itemMeta = itemMetaRepository.findByItemName(itemDto.getName())
                                    .orElseGet(() -> itemMetaRepository.save(new ItemMeta(itemDto.getName(), itemDto.getGrade(), 50010)));

                            historiesToSave.add(new MarketPriceHistory(itemMeta, itemDto.getMinPrice(), 0, now));
                        }

                        // 2. 재련 보조 재료 (50020) 수집
                        List<LostArkMarketItemDto> subItems = lostArkApiService.searchItems(50020, null, tier, null);
                        for (LostArkMarketItemDto itemDto : subItems) {
                            ItemMeta itemMeta = itemMetaRepository.findByItemName(itemDto.getName())
                                    .orElseGet(() -> itemMetaRepository.save(new ItemMeta(itemDto.getName(), itemDto.getGrade(), 50020)));

                            historiesToSave.add(new MarketPriceHistory(itemMeta, itemDto.getMinPrice(), 0, now));
                        }
                    }

                    // 3. 수집된 모든 데이터(3티어 + 4티어)를 한 번에 DB에 저장
                    historyRepository.saveAll(historiesToSave);
                    log.info(">>> 총 {}건의 시세 데이터가 DB에 저장되었습니다.", historiesToSave.size());

                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }
}