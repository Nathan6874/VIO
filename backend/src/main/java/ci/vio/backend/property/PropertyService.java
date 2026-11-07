package ci.vio.backend.property;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public List<Property> findAll() {
        return propertyRepository.findAll();
    }

    public Property create(String titre, String description, String ville,
                           String commune, Double prix) {
        Property property = new Property();
        property.setTitre(titre);
        property.setDescription(description);
        property.setVille(ville);
        property.setCommune(commune);
        property.setPrix(prix);
        property.setCreatedAt(Instant.now());
        return propertyRepository.save(property);
    }
}