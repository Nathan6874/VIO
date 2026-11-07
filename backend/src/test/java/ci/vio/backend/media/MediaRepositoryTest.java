package ci.vio.backend.media;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class MediaRepositoryTest {

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByPropertyIdShouldReturnOnlyMediaOfThatProperty() {
        User owner = new User();
        owner.setNom("Koffi");
        owner.setPrenom("Jean");
        owner.setWhatsapp("+22501020304");
        owner.setPassword("hashed");
        owner.setCreatedAt(Instant.now());
        User savedOwner = userRepository.save(owner);

        Property p1 = new Property();
        p1.setOwner(savedOwner);
        p1.setTitre("Appartement Cocody");
        p1.setVille("Abidjan");
        p1.setCommune("Cocody");
        p1.setPrix(250000.0);
        p1.setCreatedAt(Instant.now());
        Property savedP1 = propertyRepository.save(p1);

        Property p2 = new Property();
        p2.setOwner(savedOwner);
        p2.setTitre("Villa Yopougon");
        p2.setVille("Abidjan");
        p2.setCommune("Yopougon");
        p2.setPrix(450000.0);
        p2.setCreatedAt(Instant.now());
        Property savedP2 = propertyRepository.save(p2);

        Media m1 = new Media();
        m1.setProperty(savedP1);
        m1.setUrl("https://example.com/p1-photo.jpg");
        m1.setType("PHOTO");
        m1.setCreatedAt(Instant.now());
        mediaRepository.save(m1);

        Media m2 = new Media();
        m2.setProperty(savedP1);
        m2.setUrl("https://example.com/p1-pano.jpg");
        m2.setType("PANORAMA_360");
        m2.setCreatedAt(Instant.now());
        mediaRepository.save(m2);

        Media m3 = new Media();
        m3.setProperty(savedP2);
        m3.setUrl("https://example.com/p2-photo.jpg");
        m3.setType("PHOTO");
        m3.setCreatedAt(Instant.now());
        mediaRepository.save(m3);

        List<Media> mediaOfP1 = mediaRepository.findByPropertyId(savedP1.getId());
        List<Media> mediaOfP2 = mediaRepository.findByPropertyId(savedP2.getId());

        assertThat(mediaOfP1).hasSize(2);
        assertThat(mediaOfP1).extracting(Media::getUrl)
                .containsExactlyInAnyOrder(
                        "https://example.com/p1-photo.jpg",
                        "https://example.com/p1-pano.jpg"
                );

        assertThat(mediaOfP2).hasSize(1);
        assertThat(mediaOfP2.get(0).getUrl()).isEqualTo("https://example.com/p2-photo.jpg");
    }
}