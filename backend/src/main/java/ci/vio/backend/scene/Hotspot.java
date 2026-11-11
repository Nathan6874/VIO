package ci.vio.backend.scene;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "hotspot")
public class Hotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id", nullable = false)
    private Scene scene;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_scene_id")
    private Scene targetScene;

    @Enumerated(EnumType.STRING)
    @Column(name = "hotspot_type", nullable = false, length = 20)
    private HotspotType hotspotType = HotspotType.NAVIGATION;

    @Column(length = 100)
    private String label;

    @Column(nullable = false)
    private Double yaw;

    @Column(nullable = false)
    private Double pitch;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Hotspot() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Scene getScene() { return scene; }
    public void setScene(Scene scene) { this.scene = scene; }
    public Scene getTargetScene() { return targetScene; }
    public void setTargetScene(Scene targetScene) { this.targetScene = targetScene; }
    public HotspotType getHotspotType() { return hotspotType; }
    public void setHotspotType(HotspotType hotspotType) { this.hotspotType = hotspotType; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public Double getYaw() { return yaw; }
    public void setYaw(Double yaw) { this.yaw = yaw; }
    public Double getPitch() { return pitch; }
    public void setPitch(Double pitch) { this.pitch = pitch; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}