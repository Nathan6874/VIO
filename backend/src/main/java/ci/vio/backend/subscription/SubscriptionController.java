package ci.vio.backend.subscription;

import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
                .<ResponseEntity<?>>map(sub -> ResponseEntity.ok(SubscriptionResponse.from(sub)))
                .orElseGet(() -> ResponseEntity.ok(Map.of(
                        "active", false,
                        "message", "Aucun abonnement actif"
                )));
    }

    private User getUser(Authentication auth) {
        return userService.findByWhatsapp(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
    }
}