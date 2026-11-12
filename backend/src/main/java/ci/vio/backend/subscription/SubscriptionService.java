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
    public Optional<Subscription> findActiveSubscription(User user) {
        return subscriptionRepository
                .findFirstByUserIdAndStatusOrderByEndDateDesc(user.getId(), SubscriptionStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> findHistory(User user) {
        return subscriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(SubscriptionResponse::from).toList();
    }

    @Transactional
    public Subscription activate(User user, Plan plan) {
        // Annuler l'ancien abonnement actif s'il existe
        findActiveSubscription(user).ifPresent(old -> {
            old.setStatus(SubscriptionStatus.CANCELLED);
            old.setUpdatedAt(Instant.now());
            subscriptionRepository.save(old);
        });

        // Créer le nouvel abonnement
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
}