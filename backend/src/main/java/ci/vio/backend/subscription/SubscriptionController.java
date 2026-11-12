package ci.vio.backend.subscription;

import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;

    public SubscriptionController(SubscriptionService subscriptionService, UserService userService) {
        this.subscriptionService = subscriptionService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMySubscription(Authentication auth) {
        User user = getUser(auth);
        return subscriptionService.findActiveSubscription(user)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Map.of(
                        "active", false,
                        "message", "Aucun abonnement actif"
                )));
    }

    @GetMapping("/history")
    public List<SubscriptionResponse> history(Authentication auth) {
        return subscriptionService.findHistory(getUser(auth));
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancel(Authentication auth) {
        User user = getUser(auth);
        subscriptionService.cancelActive(user);
        return ResponseEntity.ok(Map.of(
                "status", "CANCELLED",
                "message", "Abonnement annulé"
        ));
    }

    private User getUser(Authentication auth) {
        return userService.findByWhatsapp(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
    }
}