package ci.vio.backend.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyViewRepository extends JpaRepository<PropertyView, Long> {
    long countByPropertyId(Long propertyId);
}