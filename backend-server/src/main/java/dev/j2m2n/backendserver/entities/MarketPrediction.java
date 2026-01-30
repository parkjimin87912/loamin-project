package dev.j2m2n.backendserver.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "market_prediction")
public class MarketPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long predictionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ItemMeta item;

    @Column(nullable = false)
    private Integer predictedPrice;

    private Float confidenceScore;

    @Column(nullable = false)
    private LocalDate predictionDate; // 며칠 자 예측인지

    @CreationTimestamp
    private LocalDateTime createdAt;

    public MarketPrediction(ItemMeta item, Integer predictedPrice, Float confidenceScore, LocalDate predictionDate) {
        this.item = item;
        this.predictedPrice = predictedPrice;
        this.confidenceScore = confidenceScore;
        this.predictionDate = predictionDate;
    }
}