package dev.j2m2n.backendserver.repositories;

import dev.j2m2n.backendserver.entities.MarketPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MarketPriceHistoryRepository extends JpaRepository<MarketPriceHistory, Long> {

    // 아이템 이름으로 시세 기록 조회 (날짜 오름차순)
    // Spring Data JPA가 메서드 이름을 분석해서 자동으로 SQL을 짜줍니다.
    // "ItemMeta" 테이블과 조인(Join)해서 "ItemName"이 같은 걸 찾습니다.
    List<MarketPriceHistory> findByItem_ItemNameOrderByCollectedAtAsc(String itemName);

    // (선택) 최근 데이터만 가져오고 싶을 때를 대비한 쿼리 예시
    @Query("SELECT h FROM MarketPriceHistory h WHERE h.item.itemName = :itemName ORDER BY h.collectedAt DESC")
    List<MarketPriceHistory> findLatestPrice(@Param("itemName") String itemName);
}