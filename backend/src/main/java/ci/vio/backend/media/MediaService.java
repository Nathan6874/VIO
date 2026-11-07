package ci.vio.backend.media;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final PropertyRepository propertyRepository;

    public MediaService(MediaRepository mediaRepository,
                        PropertyRepository propertyRepository) {
        this.mediaRepository = mediaRepository;
        this.propertyRepository = propertyRepository;
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> findAllByPropertyId(Long propertyId, User currentUser) {
        Property property = getOwnedProperty(propertyId, currentUser);
        return mediaRepository.findByPropertyId(property.getId())
                .stream()
                .map(MediaResponse::from)
                .toList();
    }

    @Transactional
    public MediaResponse addMedia(Long propertyId, User currentUser, String url, String type) {
        Property property = getOwnedProperty(propertyId, currentUser);

        Media media = new Media();
        media.setProperty(property);
        media.setUrl(url);
        media.setType(type);
        media.setCreatedAt(Instant.now());
        Media saved = mediaRepository.save(media);
        return MediaResponse.from(saved);
    }

    private Property getOwnedProperty(Long propertyId, User currentUser) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        if (property.getOwner() == null || !property.getOwner().getId().equals(currentUser.getId())) {
            throw new PropertyNotFoundException(propertyId);
        }

        return property;
    }
}