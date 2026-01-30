package dev.j2m2n.backendserver.schedulers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableScheduling // 스케줄러 기능 활성화
@RequiredArgsConstructor
public class MarketPriceScheduler {

    private final JobLauncher jobLauncher;
    private final Job marketPriceJob;

    // 1시간마다 실행 (cron 표현식: 초 분 시 일 월 요일)
    // 테스트를 위해 일단 '1분마다' 실행되도록 설정함 (0 * * * * *) -> 테스트 후 "0 0 * * * *"로 변경 예정
    @Scheduled(cron = "0 * * * * *")
    public void runJob() {
        try {
            log.info("⏰ [Scheduler] 시세 수집 배치를 실행합니다.");

            // 배치는 JobParameter가 달라야 매번 실행됨 (현재 시간을 파라미터로 넣음)
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            jobLauncher.run(marketPriceJob, jobParameters);

        } catch (Exception e) {
            log.error("❌ [Scheduler] 배치 실행 중 오류 발생", e);
        }
    }
}