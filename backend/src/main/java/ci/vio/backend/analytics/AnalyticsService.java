package ci.vio.backend.analytics;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AnalyticsService {

    private final PropertyViewRepository viewRepository;
    private final PropertyStatsRepository statsRepository;
    private final PropertyRepository propertyRepository;

    public AnalyticsService(PropertyViewRepository viewRepository,
                            PropertyStatsRepository statsRepository,
                            PropertyRepository propertyRepository) {
        this.viewRepository = viewRepository;
        this.statsRepository = statsRepository;
        this.propertyRepository = propertyRepository;
    }

    @Transactional
    public void trackView(Long propertyId, String ip, String userAgent) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        // 1. Enregistrer la vue brute
        PropertyView view = new PropertyView();
        view.setProperty(property);
        view.setViewedAt(Instant.now());
        view.setViewerIp(ip);
        view.setViewerAgent(userAgent);
        viewRepository.save(view);

        // 2. Incrémenter le compteur agrégé
        PropertyStats stats = statsRepository.findById(propertyId)
                .orElseGet(() -> {
                    PropertyStats s = new PropertyStats();
                    s.setPropertyId(propertyId);
                    s.setViewCount(0L);
                    return s;
                });
        stats.setViewCount(stats.getViewCount() + 1);
        stats.setLastViewed(Instant.now());
        statsRepository.save(stats);
    }

    @Transactional(readOnly = true)
    public long getViewCount(Long propertyId) {
        return statsRepository.findById(propertyId)
                .map(PropertyStats::getViewCount)
                .orElse(0L);
    }
}