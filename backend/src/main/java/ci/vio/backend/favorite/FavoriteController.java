package ci.vio.backend.favorite;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    public FavoriteController(FavoriteService favoriteService, UserService userService) {
        this.favoriteService = favoriteService;
        this.userService = userService;
    }

    @GetMapping
    public List<FavoriteResponse> list(Authentication authentication) {
        return favoriteService.listForUser(getUser(authentication));
    }

    @PostMapping("/{propertyId}")
    public ResponseEntity<FavoriteResponse> add(@PathVariable Long propertyId,
                                                Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(favoriteService.add(propertyId, user));
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> remove(@PathVariable Long propertyId,
                                       Authentication authentication) {
        favoriteService.remove(propertyId, getUser(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{propertyId}/status")
    public Map<String, Boolean> status(@PathVariable Long propertyId,
                                       Authentication authentication) {
        return Map.of("isFavorite",
                favoriteService.isFavorite(propertyId, getUser(authentication)));
    }

    private User getUser(Authentication authentication) {
        String whatsapp = authentication.getName();
        return userService.findByWhatsapp(whatsapp)
                .orElseThrow(() -> new IllegalStateException(
                        "Utilisateur authentifié introuvable : " + whatsapp));
    }

    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePropertyNotFound(PropertyNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "PropertyNotFound", "message", ex.getMessage()));
    }
}