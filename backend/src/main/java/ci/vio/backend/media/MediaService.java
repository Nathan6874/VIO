package ci.vio.backend.media;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final PropertyRepository propertyRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

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

    @Transactional
    public MediaResponse uploadMedia(Long propertyId, User currentUser, MultipartFile file, String type) throws IOException {
        Property property = getOwnedProperty(propertyId, currentUser);

        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;

        // Sauvegarder le fichier dans uploads/ (chemin ABSOLU)
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(uploadPath);
        Path targetPath = uploadPath.resolve(filename);
        file.transferTo(targetPath.toFile());

        // Créer l'entité Media
        String url = "/uploads/" + filename;
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