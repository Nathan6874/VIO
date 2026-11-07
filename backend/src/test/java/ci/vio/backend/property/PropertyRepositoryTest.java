package ci.vio.backend.property;

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
class PropertyRepositoryTest {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindByOwnerShouldPersistProperty() {
        User owner = new User();
        owner.setNom("Koffi");
        owner.setPrenom("Jean");
        owner.setWhatsapp("+22501020304");
        owner.setPassword("hashed");
        owner.setCreatedAt(Instant.now());
        User savedOwner = userRepository.save(owner);

        Property property = new Property();
        property.setOwner(savedOwner);
        property.setTitre("Appartement 3 pièces Cocody");
        property.setDescription("Bel appartement rénové");
        property.setVille("Abidjan");
        property.setCommune("Cocody");
        property.setPrix(250000.0);
        property.setType(PropertyType.APPARTEMENT);
        property.setNombrePieces(3);
        property.setSurface(75.0);
        property.setCreatedAt(Instant.now());

        Property saved = propertyRepository.save(property);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getType()).isEqualTo(PropertyType.APPARTEMENT);
        assertThat(saved.getNombrePieces()).isEqualTo(3);
        assertThat(saved.getSurface()).isEqualTo(75.0);

        List<Property> byOwner = propertyRepository.findByOwner(savedOwner);
        assertThat(byOwner).hasSize(1);
    }

    @Test
    void findByStatusShouldReturnOnlyMatchingProperties() {
        User owner = new User();
        owner.setNom("Koffi");
        owner.setPrenom("Jean");
        owner.setWhatsapp("+22501020304");
        owner.setPassword("hashed");
        owner.setCreatedAt(Instant.now());
        User savedOwner = userRepository.save(owner);

        Property pending = new Property();
        pending.setOwner(savedOwner);
        pending.setTitre("Pending property");
        pending.setVille("Abidjan");
        pending.setCommune("Cocody");
        pending.setPrix(250000.0);
        pending.setType(PropertyType.APPARTEMENT);
        pending.setStatus(PropertyStatus.PENDING);
        pending.setCreatedAt(Instant.now());
        propertyRepository.save(pending);

        Property approved = new Property();
        approved.setOwner(savedOwner);
        approved.setTitre("Approved property");
        approved.setVille("Abidjan");
        approved.setCommune("Yopougon");
        approved.setPrix(450000.0);
        approved.setType(PropertyType.VILLA);
        approved.setStatus(PropertyStatus.APPROVED);
        approved.setCreatedAt(Instant.now());
        propertyRepository.save(approved);

        List<Property> approvedList = propertyRepository.findByStatus(PropertyStatus.APPROVED);

        assertThat(approvedList).hasSize(1);
        assertThat(approvedList.get(0).getTitre()).isEqualTo("Approved property");
        assertThat(approvedList.get(0).getType()).isEqualTo(PropertyType.VILLA);
    }
}