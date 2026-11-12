package ci.vio.backend.subscription;

import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PlanRepository planRepository;
    private final PlanService planService;
    private final SubscriptionService subscriptionService;

    public PaymentService(PaymentRepository paymentRepository,
                          PlanRepository planRepository,
                          PlanService planService,
                          SubscriptionService subscriptionService) {
        this.paymentRepository = paymentRepository;
        this.planRepository = planRepository;
        this.planService = planService;
        this.subscriptionService = subscriptionService;
    }

    /**
     * Crée un paiement MOCK. Retourne l'URL de redirection simulée.
     * En prod, cette méthode appellera l'API Jeko.
     */
    @Transactional
    public InitiatePaymentResponse initiateMock(User user, String planCode) {
        Plan plan = planService.findByCode(planCode);

        if (plan.getPriceXof() == null || plan.getPriceXof() <= 0) {
            // Plan gratuit : activation directe, pas de paiement
            Subscription sub = subscriptionService.activate(user, plan);
            return new InitiatePaymentResponse(
                    null,
                    sub.getId(),
                    null,
                    "free-activation"
            );
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPlan(plan);
        payment.setAmountXof(plan.getPriceXof());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(PaymentProvider.MOCK);
        payment.setProviderPaymentId("MOCK-" + System.currentTimeMillis());
        payment.setCreatedAt(Instant.now());

        Payment saved = paymentRepository.save(payment);

        String mockUrl = "/owner/subscription/mock-pay/" + saved.getId();

        return new InitiatePaymentResponse(
                saved.getId(),
                null,
                mockUrl,
                "mock-payment"
        );
    }

    @Transactional
    public Payment confirmMock(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Paiement introuvable : " + paymentId));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return payment; // idempotent
        }

        Subscription subscription = subscriptionService.activate(payment.getUser(), payment.getPlan());

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setSubscription(subscription);
        payment.setPaidAt(Instant.now());
        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<Payment> history(User user) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public record InitiatePaymentResponse(
            Long paymentId,
            Long subscriptionId,
            String redirectUrl,
            String mode
    ) {}
}