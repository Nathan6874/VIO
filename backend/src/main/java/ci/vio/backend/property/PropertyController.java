package ci.vio.backend.property;

import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
                request.prix()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String whatsapp = authentication.getName();
        return userService.findByWhatsapp(whatsapp)
                .orElseThrow(() -> new IllegalStateException(
                        "Utilisateur authentifié introuvable : " + whatsapp));
    }

    public record CreatePropertyRequest(
            String titre,
            String description,
            String ville,
            String commune,
            Double prix
    ) {
    }
}