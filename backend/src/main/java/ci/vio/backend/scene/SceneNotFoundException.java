package ci.vio.backend.scene;

public class SceneNotFoundException extends RuntimeException {

    public SceneNotFoundException(Long id) {
        super("Scene introuvable : " + id);
    }
}