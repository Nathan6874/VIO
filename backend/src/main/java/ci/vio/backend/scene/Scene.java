package ci.vio.backend.scene;

import ci.vio.backend.property.Property;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scene")
public class Scene {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(name = "panorama_url", nullable = false, length = 500)
    private String panoramaUrl;

    @Column(name = "scene_order", nullable = false)
    private Integer sceneOrder = 0;

    @Column(name = "is_main_scene", nullable = false)
    private Boolean isMainScene = false;

    @Column(name = "default_yaw")
    private Double defaultYaw = 0.0;

    @Column(name = "default_pitch")
    private Double defaultPitch = 0.0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "scene", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Hotspot> hotspots = new ArrayList<>();

    public Scene() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getPanoramaUrl() { return panoramaUrl; }
    public void setPanoramaUrl(String panoramaUrl) { this.panoramaUrl = panoramaUrl; }
    public Integer getSceneOrder() { return sceneOrder; }
    public void setSceneOrder(Integer sceneOrder) { this.sceneOrder = sceneOrder; }
    public Boolean getIsMainScene() { return isMainScene; }
    public void setIsMainScene(Boolean isMainScene) { this.isMainScene = isMainScene; }
    public Double getDefaultYaw() { return defaultYaw; }
    public void setDefaultYaw(Double defaultYaw) { this.defaultYaw = defaultYaw; }
    public Double getDefaultPitch() { return defaultPitch; }
    public void setDefaultPitch(Double defaultPitch) { this.defaultPitch = defaultPitch; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<Hotspot> getHotspots() { return hotspots; }
    public void setHotspots(List<Hotspot> hotspots) { this.hotspots = hotspots; }
}