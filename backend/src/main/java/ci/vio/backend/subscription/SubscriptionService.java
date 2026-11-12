package ci.vio.backend.subscription;

import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(readOnly = true)
    public Optional<SubscriptionResponse> findActiveSubscription(User user) {
        return subscriptionRepository
                .findFirstByUserIdAndStatusOrderByEndDateDesc(user.getId(), SubscriptionStatus.ACTIVE)
                .map(SubscriptionResponse::from);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> findHistory(User user) {
        return subscriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(SubscriptionResponse::from).toList();
    }

    @Transactional
    public Subscription activate(User user, Plan plan) {
        findActiveSubscriptionEntity(user).ifPresent(old -> {
            old.setStatus(SubscriptionStatus.CANCELLED);
            old.setUpdatedAt(Instant.now());
            subscriptionRepository.save(old);
        });

        Instant now = Instant.now();
        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(now);
        subscription.setEndDate(plan.getDurationDays() != null && plan.getDurationDays() < 9999
                ? now.plus(plan.getDurationDays(), ChronoUnit.DAYS)
                : null);
        subscription.setCreatedAt(now);
        subscription.setUpdatedAt(now);

        return subscriptionRepository.save(subscription);
    }

    private Optional<Subscription> findActiveSubscriptionEntity(User user) {
        return subscriptionRepository
                .findFirstByUserIdAndStatusOrderByEndDateDesc(user.getId(), SubscriptionStatus.ACTIVE);
    }

    @Transactional
    public void cancelActive(User user) {
        findActiveSubscriptionEntity(user).ifPresent(sub -> {
            sub.setStatus(SubscriptionStatus.CANCELLED);
            sub.setUpdatedAt(Instant.now());
            subscriptionRepository.save(sub);
        });
    }
}