package ci.vio.backend.subscription;

import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PlanService planService;
    private final SubscriptionService subscriptionService;
    private final JekoService jekoService;

    public PaymentService(PaymentRepository paymentRepository,
                          PlanService planService,
                          SubscriptionService subscriptionService,
                          JekoService jekoService) {
        this.paymentRepository = paymentRepository;
        this.planService = planService;
        this.subscriptionService = subscriptionService;
        this.jekoService = jekoService;
    }

    /**
     * Initie un paiement :
     * - Plan gratuit → activation directe
     * - Plan payant → appel Jeko, retourne redirectUrl
     */
    @Transactional
    public InitiatePaymentResponse initiate(User user, String planCode) {
        Plan plan = planService.findByCode(planCode);

        // Plan gratuit → activation directe
        if (plan.getPriceXof() == null || plan.getPriceXof() <= 0) {
            Subscription sub = subscriptionService.activate(user, plan);
            return new InitiatePaymentResponse(null, sub.getId(), null, "free-activation");
        }

        // Créer le Payment en PENDING
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPlan(plan);
        payment.setAmountXof(plan.getPriceXof());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(PaymentProvider.JEKO);
        payment.setCreatedAt(Instant.now());
        Payment saved = paymentRepository.save(payment);

        // Appel Jeko
        try {
            JekoService.JekoPaymentResponse jekoResp = jekoService.initiatePayment(plan, user, saved.getId());
            saved.setProviderPaymentId(jekoResp.jekoPaymentId());
            paymentRepository.save(saved);
            return new InitiatePaymentResponse(saved.getId(), null, jekoResp.redirectUrl(), "jeko-payment");
        } catch (RuntimeException e) {
            saved.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(saved);
            throw e;
        }
    }

    /**
     * Appelé par le webhook Jeko quand status=success.
     * Active l'abonnement (idempotent : ne fait rien si déjà activé).
     */
    @Transactional
    public void confirmByReference(String reference) {
        // La référence est "VIO-{paymentId}-{uuid}"
        if (reference == null || !reference.startsWith("VIO-")) {
            System.err.println(">>> Référence invalide: " + reference);
            return;
        }

        String[] parts = reference.split("-");
        if (parts.length < 2) return;

        Long paymentId;
        try {
            paymentId = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            System.err.println(">>> Impossible de parser paymentId: " + parts[1]);
            return;
        }

        Payment payment = paymentRepository.findById(paymentId).orElse(null);
        if (payment == null) {
            System.err.println(">>> Payment introuvable: " + paymentId);
            return;
        }

        // Idempotence : si déjà SUCCESS, on ne fait rien
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            System.out.println(">>> Payment déjà SUCCESS, idempotent");
            return;
        }

        // Activer l'abonnement
        Subscription subscription = subscriptionService.activate(payment.getUser(), payment.getPlan());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setSubscription(subscription);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);
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