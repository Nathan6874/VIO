package ci.vio.backend.scene;

public record SceneRequest(
        String label,
        String panoramaUrl,
        Integer sceneOrder,
        Boolean isMainScene,
        Double defaultYaw,
        Double defaultPitch
) {
}