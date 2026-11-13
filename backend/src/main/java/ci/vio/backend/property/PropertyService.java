package ci.vio.backend.property;

import ci.vio.backend.subscription.Plan;
import ci.vio.backend.subscription.SubscriptionService;
import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final SubscriptionService subscriptionService;

    public PropertyService(PropertyRepository propertyRepository,
                           SubscriptionService subscriptionService) {
        this.propertyRepository = propertyRepository;
        this.subscriptionService = subscriptionService;
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
                                   String ville, String commune, Double prix,
                                   PropertyType type, Integer nombrePieces, Double surface) {

        // 1. Vérifier la limite du plan
        Plan plan = subscriptionService.getCurrentPlan(owner);
        if (plan != null && plan.getMaxProperties() != null) {
            long currentCount = propertyRepository.findByOwner(owner).size();
            if (currentCount >= plan.getMaxProperties()) {
                throw new PropertyLimitExceededException(
                        "Limite atteinte : votre plan " + plan.getName() +
                                " permet " + plan.getMaxProperties() + " annonce(s) maximum. " +
                                "Passez à un plan supérieur pour publier plus."
                );
            }
        }

        Property property = new Property();
        property.setOwner(owner);
        property.setTitre(titre);
        property.setDescription(description);
        property.setVille(ville);
        property.setCommune(commune);
        property.setPrix(prix);
        property.setType(type);
        property.setNombrePieces(nombrePieces);
        property.setSurface(surface);
        property.setCreatedAt(Instant.now());
        Property saved = propertyRepository.save(property);
        return PropertyResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findAllApproved() {
        return propertyRepository.findByStatus(PropertyStatus.APPROVED)
                .stream()
                .map(PropertyResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PropertyResponse findApprovedById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException(id));
        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new PropertyNotFoundException(id);
        }
        return PropertyResponse.from(property);
    }
}