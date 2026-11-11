package ci.vio.backend.scene;

import java.time.Instant;

public record SceneResponse(
        Long id,
        Long propertyId,
        String label,
        String panoramaUrl,
        Integer sceneOrder,
        Boolean isMainScene,
        Double defaultYaw,
        Double defaultPitch,
        Instant createdAt
) {
    public static SceneResponse from(Scene scene) {
        return new SceneResponse(
                scene.getId(),
                scene.getProperty() != null ? scene.getProperty().getId() : null,
                scene.getLabel(),
                scene.getPanoramaUrl(),
                scene.getSceneOrder(),
                scene.getIsMainScene(),
                scene.getDefaultYaw(),
                scene.getDefaultPitch(),
                scene.getCreatedAt()
        );
    }
}