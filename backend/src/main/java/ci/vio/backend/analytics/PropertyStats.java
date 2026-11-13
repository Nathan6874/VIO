package ci.vio.backend.analytics;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "property_stats")
public class PropertyStats {

    @Id
    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Column(name = "last_viewed")
    private Instant lastViewed;

    public PropertyStats() {}

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }
    public Instant getLastViewed() { return lastViewed; }
    public void setLastViewed(Instant lastViewed) { this.lastViewed = lastViewed; }
}