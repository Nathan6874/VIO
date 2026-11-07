package ci.vio.backend.property;

public class PropertyNotFoundException extends RuntimeException {

    public PropertyNotFoundException(Long id) {
        super("Propriété introuvable : " + id);
    }
}