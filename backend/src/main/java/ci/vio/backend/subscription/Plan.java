package ci.vio.backend.subscription;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "price_xof", nullable = false)
    private Integer priceXof = 0;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays = 30;

    @Column(name = "max_properties")
    private Integer maxProperties;

    @Column(name = "max_scenes")
    private Integer maxScenes;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Plan() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getPriceXof() { return priceXof; }
    public void setPriceXof(Integer priceXof) { this.priceXof = priceXof; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    public Integer getMaxProperties() { return maxProperties; }
    public void setMaxProperties(Integer maxProperties) { this.maxProperties = maxProperties; }
    public Integer getMaxScenes() { return maxScenes; }
    public void setMaxScenes(Integer maxScenes) { this.maxScenes = maxScenes; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}