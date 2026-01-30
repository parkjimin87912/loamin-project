package dev.j2m2n.backendserver.entities;

import dev.j2m2n.backendserver.entities.ItemMeta;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "market_price_history", indexes = {
        @Index(name = "idx_item_date", columnList = "item_id, collected_at")
})
public class MarketPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY) // 중요: 아이템 정보와 연결
    @JoinColumn(name = "item_id", nullable = false)
    private ItemMeta item;

    @Column(nullable = false)
    private Integer price;

    private Integer tradeCount;

    @Column(nullable = false)
    private LocalDateTime collectedAt;

    public MarketPriceHistory(ItemMeta item, Integer price, Integer tradeCount, LocalDateTime collectedAt) {
        this.item = item;
        this.price = price;
        this.tradeCount = tradeCount;
        this.collectedAt = collectedAt;
    }
}