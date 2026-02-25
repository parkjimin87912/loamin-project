package dev.j2m2n.backendserver.configs;

import dev.j2m2n.backendserver.dtos.LostArkMarketItemDto;
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

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MarketDataBatchConfig {

    private final LostArkApiService lostArkApiService;

    // 배치 Job 생성
    @Bean
    public Job marketDataJob(JobRepository jobRepository, Step fetchMarketDataStep) {
        return new JobBuilder("marketDataJob", jobRepository)
                .start(fetchMarketDataStep)
                .build();
    }

    // 배치 Step 생성
    @Bean
    public Step fetchMarketDataStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("fetchMarketDataStep", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    log.info(">>> 로스트아크 마켓 데이터 수집 시작");

                    // 1. 일반 재련 재료 (50010) 수집
                    List<LostArkMarketItemDto> items = lostArkApiService.searchItems(50010, null, null, null);

                    // 🌟 2. 재련 보조 재료 (50020 - 책, 숨결) 수집 추가!
                    List<LostArkMarketItemDto> subItems = lostArkApiService.searchItems(50020, null, null, null);

                    // 두 리스트를 하나로 합치기
                    items.addAll(subItems);

                    log.info(">>> 수집된 총 아이템 개수: {}", items.size());

                    // (DB 저장 로직이 있다면 여기서 items 리스트를 통째로 저장하시면 됩니다)
                    for (LostArkMarketItemDto item : items) {
                        log.info("아이템: {} (최저가: {} G)", item.getName(), item.getMinPrice());
                    }

                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }
}