package dev.j2m2n.backendserver.repositories;

import dev.j2m2n.backendserver.entities.ItemMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ItemMetaRepository extends JpaRepository<ItemMeta, Long> {
    // 아이템 이름으로 이미 DB에 있는지 확인하는 메서드
    Optional<ItemMeta> findByItemName(String itemName);
}