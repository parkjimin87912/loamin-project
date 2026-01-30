package dev.j2m2n.backendserver.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "item_meta") // DB 테이블 이름 지정
public class ItemMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @Column(nullable = false, unique = true)
    private String itemName;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private Integer categoryCode;

    @CreationTimestamp // 데이터 저장될 때 시간 자동 기록
    private LocalDateTime createdAt;

    // 생성자 (객체 생성을 편하게 하기 위해 추가)
    public ItemMeta(String itemName, String grade, Integer categoryCode) {
        this.itemName = itemName;
        this.grade = grade;
        this.categoryCode = categoryCode;
    }
}