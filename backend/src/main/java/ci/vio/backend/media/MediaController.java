package ci.vio.backend.media;

import ci.vio.backend.property.PropertyNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties/{propertyId}/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    public List<MediaResponse> findAll(@PathVariable Long propertyId) {
        return mediaService.findAllByPropertyId(propertyId);
    }

    @PostMapping
    public ResponseEntity<MediaResponse> create(@PathVariable Long propertyId,
                                                @RequestBody CreateMediaRequest request) {
        MediaResponse media = mediaService.addMedia(
                propertyId,
                request.url(),
                request.type()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(media);
    }

    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePropertyNotFound(PropertyNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "PropertyNotFound", "message", ex.getMessage()));
    }

    public record CreateMediaRequest(String url, String type) {
    }
}