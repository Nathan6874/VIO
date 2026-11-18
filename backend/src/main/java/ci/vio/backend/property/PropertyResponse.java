package ci.vio.backend.property;

import ci.vio.backend.media.MediaRepository;
import ci.vio.backend.scene.SceneRepository;
import java.time.Instant;
import java.util.List;

public record PropertyResponse(
        Long id,
        String titre,
        String description,
        String ville,
        String commune,
        Double prix,
        PropertyType type,
        Integer nombrePieces,
        Double surface,
        PropertyStatus status,
        Instant createdAt,
        OwnerInfo owner,
        String coverImageUrl,
        int sceneCount
) {
    public record OwnerInfo(
            Long id,
            String nom,
            String prenom,
            String whatsapp
    ) {
    }

    /**
     * Version sans médias/scènes (utilisée si les repositories ne sont pas injectés).
     */
    public static PropertyResponse from(Property property) {
        return from(property, null, null);
    }

    /**
     * Version complète : expose la 1ère image (cover) et le nombre de scènes 3D.
     */
    public static PropertyResponse from(Property property,
                                        MediaRepository mediaRepository,
                                        SceneRepository sceneRepository) {
        OwnerInfo ownerInfo = null;
        if (property.getOwner() != null) {
            ownerInfo = new OwnerInfo(
                    property.getOwner().getId(),
                    property.getOwner().getNom(),
                    property.getOwner().getPrenom(),
                    property.getOwner().getWhatsapp()
            );
        }

        String coverImageUrl = null;
        if (mediaRepository != null) {
            List<ci.vio.backend.media.Media> medias = mediaRepository.findByPropertyId(property.getId());
            if (medias != null && !medias.isEmpty()) {
                // On suppose que le 1er média est la cover. À trier par ordre si besoin.
                coverImageUrl = medias.get(0).getUrl();
            }
        }

        int sceneCount = 0;
        if (sceneRepository != null) {
            sceneCount = (int) sceneRepository.countByPropertyId(property.getId());
        }

        return new PropertyResponse(
                property.getId(),
                property.getTitre(),
                property.getDescription(),
                property.getVille(),
                property.getCommune(),
                property.getPrix(),
                property.getType(),
                property.getNombrePieces(),
                property.getSurface(),
                property.getStatus(),
                property.getCreatedAt(),
                ownerInfo,
                coverImageUrl,
                sceneCount
        );
    }
}