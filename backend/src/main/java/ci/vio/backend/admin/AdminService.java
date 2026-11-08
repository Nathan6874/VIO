package ci.vio.backend.admin;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.property.PropertyResponse;
import ci.vio.backend.property.PropertyStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final PropertyRepository propertyRepository;

    public AdminService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Transactional
    public PropertyResponse approve(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));
        property.setStatus(PropertyStatus.APPROVED);
        Property saved = propertyRepository.save(property);
        return PropertyResponse.from(saved);
    }

    @Transactional
    public PropertyResponse reject(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));
        property.setStatus(PropertyStatus.REJECTED);
        Property saved = propertyRepository.save(property);
        return PropertyResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findPendingProperties() {
        return propertyRepository.findByStatus(PropertyStatus.PENDING)
                .stream()
                .map(PropertyResponse::from)
                .toList();
    }
}