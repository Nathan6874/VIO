package ci.vio.backend.subscription;

import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    public PaymentController(PaymentService paymentService, UserService userService) {
        this.paymentService = paymentService;
        this.userService = userService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiate(@RequestBody InitiateRequest request, Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.initiateMock(user, request.planCode()));
    }

    @PostMapping("/mock-confirm/{paymentId}")
    public ResponseEntity<?> mockConfirm(@PathVariable Long paymentId) {
        Payment payment = paymentService.confirmMock(paymentId);
        return ResponseEntity.ok(Map.of(
                "status", payment.getStatus().name(),
                "paymentId", payment.getId(),
                "subscriptionId", payment.getSubscription() != null ? payment.getSubscription().getId() : null
        ));
    }

    @GetMapping("/history")
    public List<Map<String, Object>> history(Authentication auth) {
        User user = getUser(auth);
        return paymentService.history(user).stream()
                .map(p -> Map.<String, Object>of(
                        "id", p.getId(),
                        "planCode", p.getPlan().getCode(),
                        "amountXof", p.getAmountXof(),
                        "status", p.getStatus().name(),
                        "createdAt", p.getCreatedAt().toString()
                ))
                .toList();
    }

    private User getUser(Authentication auth) {
        return userService.findByWhatsapp(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
    }

    public record InitiateRequest(String planCode) {}
}