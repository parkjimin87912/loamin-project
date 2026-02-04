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

                    // [수정] searchItems 메서드 시그니처 변경에 맞춰 인자 4개 전달
                    // (카테고리코드, 아이템명, 티어, 등급)
                    // itemName=null, tier=null, grade=null
                    List<LostArkMarketItemDto> items = lostArkApiService.searchItems(50010, null, null, null);

                    log.info(">>> 수집된 아이템 개수: {}", items.size());

                    for (LostArkMarketItemDto item : items) {
                        log.info("아이템: {} (최저가: {} G)", item.getName(), item.getMinPrice());
                    }

                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }
}