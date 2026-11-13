package ci.vio.backend.analytics;

import java.time.Instant;

public record PropertyStatsDto(
        Long propertyId,
        String propertyTitre,
        long viewCount,
        Instant lastViewed
) {
}