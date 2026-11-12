package ci.vio.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findFirstByUserIdAndStatusOrderByEndDateDesc(
            Long userId, SubscriptionStatus status);

    List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);
}