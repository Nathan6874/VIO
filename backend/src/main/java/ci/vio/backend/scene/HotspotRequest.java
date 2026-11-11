package ci.vio.backend.scene;

public record HotspotRequest(
        Long targetSceneId,
        String label,
        Double yaw,
        Double pitch
) {
}