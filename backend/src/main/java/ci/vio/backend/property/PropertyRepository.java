package ci.vio.backend.property;

import ci.vio.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByOwner(User owner);
    List<Property> findByStatus(PropertyStatus status);
}