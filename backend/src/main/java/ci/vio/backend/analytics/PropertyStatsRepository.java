package ci.vio.backend.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyStatsRepository extends JpaRepository<PropertyStats, Long> {
    List<PropertyStats> findByPropertyIdIn(List<Long> propertyIds);
}