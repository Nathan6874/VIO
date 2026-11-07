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
        property.setCreatedAt(Instant.now());

        Property saved = propertyRepository.save(property);

        assertThat(saved.getId()).isNotNull();

        List<Property> byOwner = propertyRepository.findByOwner(savedOwner);
        assertThat(byOwner).hasSize(1);
        assertThat(byOwner.get(0).getTitre()).isEqualTo("Appartement 3 pièces Cocody");
        assertThat(byOwner.get(0).getVille()).isEqualTo("Abidjan");
        assertThat(byOwner.get(0).getPrix()).isEqualTo(250000.0);
    }
}