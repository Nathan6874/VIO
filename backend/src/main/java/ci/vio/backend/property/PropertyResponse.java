package ci.vio.backend.property;

import java.time.Instant;

public record PropertyResponse(
        Long id,
        String titre,
        String description,
        String ville,
        String commune,
        Double prix,
        PropertyStatus status,
        Instant createdAt,
        OwnerInfo owner
) {
    public record OwnerInfo(
            Long id,
            String nom,
            String prenom,
            String whatsapp
    ) {
    }

    public static PropertyResponse from(Property property) {
        OwnerInfo ownerInfo = null;
        if (property.getOwner() != null) {
            ownerInfo = new OwnerInfo(
                    property.getOwner().getId(),
                    property.getOwner().getNom(),
                    property.getOwner().getPrenom(),
                    property.getOwner().getWhatsapp()
            );
        }
        return new PropertyResponse(
                property.getId(),
                property.getTitre(),
                property.getDescription(),
                property.getVille(),
                property.getCommune(),
                property.getPrix(),
                property.getStatus(),
                property.getCreatedAt(),
                ownerInfo
        );
    }
}