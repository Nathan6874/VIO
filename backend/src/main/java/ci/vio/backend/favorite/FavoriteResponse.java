package ci.vio.backend.favorite;

import java.time.Instant;

public record FavoriteResponse(
        Long id,
        Long propertyId,
        String propertyTitre,
        String propertyVille,
        String propertyCommune,
        Double propertyPrix,
        String propertyType,
        Instant createdAt
) {
    public static FavoriteResponse from(Favorite favorite) {
        var p = favorite.getProperty();
        return new FavoriteResponse(
                favorite.getId(),
                p != null ? p.getId() : null,
                p != null ? p.getTitre() : null,
                p != null ? p.getVille() : null,
                p != null ? p.getCommune() : null,
                p != null ? p.getPrix() : null,
                p != null && p.getType() != null ? p.getType().name() : null,
                favorite.getCreatedAt()
        );
    }
}