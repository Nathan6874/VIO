package ci.vio.backend.analytics;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final PropertyRepository propertyRepository;
    private final UserService userService;

    public AnalyticsController(AnalyticsService analyticsService,
                               PropertyRepository propertyRepository,
                               UserService userService) {
        this.analyticsService = analyticsService;
        this.propertyRepository = propertyRepository;
        this.userService = userService;
    }

    /** Endpoint PUBLIC : tracker une vue (URL /public/ pour matcher SecurityConfig) */
    @PostMapping("/properties/{propertyId}/public/view")
    public ResponseEntity<Map<String, Object>> trackView(@PathVariable Long propertyId,
                                                         HttpServletRequest request) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        analyticsService.trackView(propertyId, ip, userAgent);
        return ResponseEntity.ok(Map.of(
                "status", "tracked",
                "propertyId", propertyId
        ));
    }

    /** Endpoint PUBLIC : nombre de vues d'une annonce */
    @GetMapping("/properties/{propertyId}/public/views")
    public Map<String, Long> getViewCount(@PathVariable Long propertyId) {
        return Map.of("viewCount", analyticsService.getViewCount(propertyId));
    }

    /** Endpoint OWNER : stats de toutes ses annonces */
    @GetMapping("/owner/stats")
    public List<PropertyStatsDto> getMyStats(Authentication auth) {
        User user = userService.findByWhatsapp(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));

        List<Property> properties = propertyRepository.findByOwner(user);
        List<PropertyStatsDto> result = new ArrayList<>();

        for (Property p : properties) {
            long count = analyticsService.getViewCount(p.getId());
            result.add(new PropertyStatsDto(p.getId(), p.getTitre(), count, null));
        }

        return result;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isEmpty()) {
            return xForwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}