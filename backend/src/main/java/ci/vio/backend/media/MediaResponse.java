package ci.vio.backend.media;

import java.time.Instant;

public record MediaResponse(
        Long id,
        String url,
        String type,
        Long propertyId,
        Instant createdAt
) {
    public static MediaResponse from(Media media) {
        return new MediaResponse(
                media.getId(),
                media.getUrl(),
                media.getType(),
                media.getProperty() != null ? media.getProperty().getId() : null,
                media.getCreatedAt()
        );
    }
}