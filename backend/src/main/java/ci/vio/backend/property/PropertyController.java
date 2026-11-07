package ci.vio.backend.property;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public List<Property> findAll() {
        return propertyService.findAll();
    }

    @PostMapping
    public ResponseEntity<Property> create(@RequestBody CreatePropertyRequest request) {
        Property property = propertyService.create(
                request.titre(),
                request.description(),
                request.ville(),
                request.commune(),
                request.prix()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(property);
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