package dev.j2m2n.backendserver.configs;

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

                    // [수정 포인트] getMarketItems -> searchItems 로 변경
                    // 재련 재료 카테고리 코드: 50010
                    List<LostArkApiService.MarketItemDto> items = lostArkApiService.searchItems(50010);

                    log.info(">>> 수집된 아이템 개수: {}", items.size());

                    // 여기서 DB에 저장하는 로직 등을 추가할 수 있습니다.
                    // 예: itemRepository.saveAll(items.map(this::toEntity));

                    for (LostArkApiService.MarketItemDto item : items) {
                        log.info("아이템: {} (최저가: {} G)", item.getName(), item.getCurrentMinPrice());
                    }

                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }
}