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
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MarketDataBatchConfig {

    private final LostArkApiService lostArkApiService;
    private final ItemMetaRepository itemMetaRepository;
    private final MarketPriceHistoryRepository marketPriceHistoryRepository;

    // 1. Job 정의 (전체 작업의 이름)
    @Bean
    public Job marketPriceJob(JobRepository jobRepository, Step collectStep) {
        return new JobBuilder("marketPriceJob", jobRepository)
                .start(collectStep) // 시작하면 collectStep을 실행하라
                .build();
    }

    // 2. Step 정의 (작업의 한 단계)
    @Bean
    public Step collectStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("collectStep", jobRepository)
                .tasklet(collectMarketDataTasklet(), transactionManager) // 이 로직을 실행하라
                .build();
    }

    // 3. 실제 로직 (Tasklet)
    @Bean
    public Tasklet collectMarketDataTasklet() {
        return (contribution, chunkContext) -> {
            log.info("============== [Batch] 로스트아크 시세 수집 시작 ==============");

            // (1) API 호출 (전설 각인서 카테고리 코드: 40000)
            int categoryCode = 40000;
            List<LostArkMarketItemDto> items = lostArkApiService.getMarketItems(categoryCode);

            log.info("수신된 아이템 개수: {}", items.size());

            // (2) 데이터 저장 로직
            for (LostArkMarketItemDto dto : items) {
                // 2-1. ItemMeta가 없으면 새로 등록 (이름으로 중복 확인)
                ItemMeta itemMeta = itemMetaRepository.findByItemName(dto.getName())
                        .orElseGet(() -> {
                            ItemMeta newItem = new ItemMeta(
                                    dto.getName(),
                                    dto.getGrade(),
                                    categoryCode
                            );
                            return itemMetaRepository.save(newItem);
                        });

                // 2-2. 시세 이력(History) 저장
                MarketPriceHistory history = new MarketPriceHistory(
                        itemMeta,
                        dto.getCurrentMinPrice(),
                        dto.getTradeCount(),
                        LocalDateTime.now() // 수집 시간
                );
                marketPriceHistoryRepository.save(history);
            }

            log.info("============== [Batch] 수집 완료 ==============");
            return RepeatStatus.FINISHED;
        };
    }
}