package ci.vio.backend.scene;

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
@RequestMapping("/api")
public class SceneController {

    private final SceneService sceneService;
    private final UserService userService;

    public SceneController(SceneService sceneService, UserService userService) {
        this.sceneService = sceneService;
        this.userService = userService;
    }

    @PostMapping("/properties/{propertyId}/scenes")
    public ResponseEntity<SceneResponse> createScene(@PathVariable Long propertyId,
                                                     @RequestBody SceneRequest request,
                                                     Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sceneService.createScene(propertyId, user, request));
    }

    @GetMapping("/properties/{propertyId}/scenes")
    public List<SceneResponse> findScenesByProperty(@PathVariable Long propertyId,
                                                    Authentication authentication) {
        return sceneService.findScenesByProperty(propertyId, getUser(authentication));
    }

    @GetMapping("/properties/{propertyId}/scenes/public")
    public List<SceneResponse> findScenesByPropertyPublic(@PathVariable Long propertyId) {
        return sceneService.findScenesByPropertyPublic(propertyId);
    }

    @PostMapping("/scenes/{sceneId}/hotspots")
    public ResponseEntity<HotspotResponse> createHotspot(@PathVariable Long sceneId,
                                                         @RequestBody HotspotRequest request,
                                                         Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sceneService.createHotspot(sceneId, user, request));
    }

    @GetMapping("/scenes/{sceneId}/hotspots")
    public List<HotspotResponse> findHotspotsByScene(@PathVariable Long sceneId,
                                                     Authentication authentication) {
        return sceneService.findHotspotsByScene(sceneId, getUser(authentication));
    }

    @GetMapping("/scenes/{sceneId}/hotspots/public")
    public List<HotspotResponse> findHotspotsByScenePublic(@PathVariable Long sceneId) {
        return sceneService.findHotspotsByScenePublic(sceneId);
    }

    @DeleteMapping("/scenes/{sceneId}")
    public ResponseEntity<Void> deleteScene(@PathVariable Long sceneId,
                                            Authentication authentication) {
        sceneService.deleteScene(sceneId, getUser(authentication));
        return ResponseEntity.noContent().build();
    }

    private User getUser(Authentication authentication) {
        String whatsapp = authentication.getName();
        return userService.findByWhatsapp(whatsapp)
                .orElseThrow(() -> new IllegalStateException(
                        "Utilisateur authentifie introuvable : " + whatsapp));
    }

    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePropertyNotFound(PropertyNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "PropertyNotFound", "message", ex.getMessage()));
    }

    @ExceptionHandler(SceneNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleSceneNotFound(SceneNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "SceneNotFound", "message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "BadRequest", "message", ex.getMessage()));
    }
}