package ci.vio.backend.property;

import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findAllByOwner(User owner) {
        return propertyRepository.findByOwner(owner)
                .stream()
                .map(PropertyResponse::from)
                .toList();
    }

    @Transactional
    public PropertyResponse create(User owner, String titre, String description,
                                   String ville, String commune, Double prix) {
        Property property = new Property();
        property.setOwner(owner);
        property.setTitre(titre);
        property.setDescription(description);
        property.setVille(ville);
        property.setCommune(commune);
        property.setPrix(prix);
        property.setCreatedAt(Instant.now());
        Property saved = propertyRepository.save(property);
        return PropertyResponse.from(saved);
    }
}