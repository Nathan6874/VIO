package ci.vio.backend.scene;

import java.time.Instant;

public record HotspotResponse(
        Long id,
        Long sceneId,
        Long targetSceneId,
        HotspotType hotspotType,
        String label,
        Double yaw,
        Double pitch,
        Instant createdAt
) {
    public static HotspotResponse from(Hotspot hotspot) {
        return new HotspotResponse(
                hotspot.getId(),
                hotspot.getScene() != null ? hotspot.getScene().getId() : null,
                hotspot.getTargetScene() != null ? hotspot.getTargetScene().getId() : null,
                hotspot.getHotspotType(),
                hotspot.getLabel(),
                hotspot.getYaw(),
                hotspot.getPitch(),
                hotspot.getCreatedAt()
        );
    }
}