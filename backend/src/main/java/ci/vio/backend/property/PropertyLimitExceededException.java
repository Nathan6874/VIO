package ci.vio.backend.property;

public class PropertyLimitExceededException extends RuntimeException {
    public PropertyLimitExceededException(String message) {
        super(message);
    }
}