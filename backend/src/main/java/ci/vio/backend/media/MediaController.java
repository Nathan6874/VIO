package ci.vio.backend.media;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties/{propertyId}/media")
public class MediaController {

    private final MediaService mediaService;
    private final UserService userService;

    public MediaController(MediaService mediaService, UserService userService) {
        this.mediaService = mediaService;
        this.userService = userService;
    }

    @GetMapping
    public List<MediaResponse> findAll(@PathVariable Long propertyId,
                                       Authentication authentication) {
        User currentUser = getUserFromAuthentication(authentication);
        return mediaService.findAllByPropertyId(propertyId, currentUser);
    }

    @PostMapping
    public ResponseEntity<MediaResponse> create(@PathVariable Long propertyId,
                                                @RequestBody CreateMediaRequest request,
                                                Authentication authentication) {
        User currentUser = getUserFromAuthentication(authentication);
        MediaResponse media = mediaService.addMedia(
                propertyId,
                currentUser,
                request.url(),
                request.type()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(media);
    }

    @PostMapping("/upload")
    public ResponseEntity<MediaResponse> upload(
            @PathVariable Long propertyId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            Authentication authentication) throws IOException {
        User currentUser = getUserFromAuthentication(authentication);
        MediaResponse media = mediaService.uploadMedia(propertyId, currentUser, file, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(media);
    }

    private User getUserFromAuthentication(Authentication authentication) {
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

    public record CreateMediaRequest(String url, String type) {
    }
}