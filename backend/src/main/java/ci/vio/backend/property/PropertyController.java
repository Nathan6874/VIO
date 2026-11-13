package ci.vio.backend.property;

import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final UserService userService;

    public PropertyController(PropertyService propertyService, UserService userService) {
        this.propertyService = propertyService;
        this.userService = userService;
    }

    @GetMapping
    public List<PropertyResponse> findAll(Authentication authentication) {
        User owner = getUserFromAuthentication(authentication);
        return propertyService.findAllByOwner(owner);
    }

    @GetMapping("/public")
    public List<PropertyResponse> findAllPublic() {
        return propertyService.findAllApproved();
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<PropertyResponse> findPublicById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.findApprovedById(id));
    }

    @PostMapping
    public ResponseEntity<PropertyResponse> create(@RequestBody CreatePropertyRequest request,
                                                   Authentication authentication) {
        User owner = getUserFromAuthentication(authentication);
        PropertyResponse response = propertyService.create(
                owner,
                request.titre(),
                request.description(),
                request.ville(),
                request.commune(),
                request.prix(),
                request.type(),
                request.nombrePieces(),
                request.surface()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public record CreatePropertyRequest(
            String titre,
            String description,
            String ville,
            String commune,
            Double prix,
            PropertyType type,
            Integer nombrePieces,
            Double surface
    ) {
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String whatsapp = authentication.getName();
        return userService.findByWhatsapp(whatsapp)
                .orElseThrow(() -> new IllegalStateException(
                        "Utilisateur authentifié introuvable : " + whatsapp));
    }

    @ExceptionHandler(PropertyLimitExceededException.class)
    public ResponseEntity<Map<String, String>> handleLimitExceeded(PropertyLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error", "PropertyLimitExceeded",
                        "message", ex.getMessage()
                ));
    }

}