package dev.j2m2n.backendserver.repositories;

import dev.j2m2n.backendserver.entities.MarketPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketPredictionRepository extends JpaRepository<MarketPrediction, Long> {
}