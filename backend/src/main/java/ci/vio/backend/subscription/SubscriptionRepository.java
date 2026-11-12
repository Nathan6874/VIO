package ci.vio.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    @Query("SELECT s FROM Subscription s JOIN FETCH s.plan " +
            "WHERE s.user.id = :userId AND s.status = :status " +
            "ORDER BY s.endDate DESC")
    Optional<Subscription> findFirstByUserIdAndStatusOrderByEndDateDesc(
            @Param("userId") Long userId,
            @Param("status") SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s JOIN FETCH s.plan " +
            "WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<Subscription> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
}