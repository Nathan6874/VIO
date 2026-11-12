package ci.vio.backend.favorite;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.property.PropertyStatus;
import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           PropertyRepository propertyRepository) {
        this.favoriteRepository = favoriteRepository;
        this.propertyRepository = propertyRepository;
    }

    @Transactional
    public FavoriteResponse add(Long propertyId, User user) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        // On peut mettre en favori n'importe quelle annonce APPROVED
        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new PropertyNotFoundException(propertyId);
        }

        if (favoriteRepository.existsByUserIdAndPropertyId(user.getId(), propertyId)) {
            // Déjà en favori → on renvoie l'existant (idempotent)
            return favoriteRepository.findByUserIdAndPropertyId(user.getId(), propertyId)
                    .map(FavoriteResponse::from)
                    .orElseThrow();
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProperty(property);
        favorite.setCreatedAt(Instant.now());

        return FavoriteResponse.from(favoriteRepository.save(favorite));
    }

    @Transactional
    public void remove(Long propertyId, User user) {
        favoriteRepository.findByUserIdAndPropertyId(user.getId(), propertyId)
                .ifPresent(favoriteRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> listForUser(User user) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(FavoriteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(Long propertyId, User user) {
        return favoriteRepository.existsByUserIdAndPropertyId(user.getId(), propertyId);
    }

    @Transactional(readOnly = true)
    public long countForProperty(Long propertyId) {
        return favoriteRepository.countByPropertyId(propertyId);
    }
}