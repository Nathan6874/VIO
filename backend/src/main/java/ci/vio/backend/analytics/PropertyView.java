package ci.vio.backend.analytics;

import ci.vio.backend.property.Property;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "property_views")
public class PropertyView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "viewed_at", nullable = false)
    private Instant viewedAt;

    @Column(name = "viewer_ip", length = 45)
    private String viewerIp;

    @Column(name = "viewer_agent", columnDefinition = "TEXT")
    private String viewerAgent;

    public PropertyView() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    public Instant getViewedAt() { return viewedAt; }
    public void setViewedAt(Instant viewedAt) { this.viewedAt = viewedAt; }
    public String getViewerIp() { return viewerIp; }
    public void setViewerIp(String viewerIp) { this.viewerIp = viewerIp; }
    public String getViewerAgent() { return viewerAgent; }
    public void setViewerAgent(String viewerAgent) { this.viewerAgent = viewerAgent; }
}