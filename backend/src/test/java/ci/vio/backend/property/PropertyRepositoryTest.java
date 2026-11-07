package ci.vio.backend.property;

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

    @Test
    void saveAndFindAllShouldPersistProperty() {
        Property property = new Property();
        property.setTitre("Appartement 3 pièces Cocody");
        property.setDescription("Bel appartement rénové");
        property.setVille("Abidjan");
        property.setCommune("Cocody");
        property.setPrix(250000.0);
        property.setCreatedAt(Instant.now());

        Property saved = propertyRepository.save(property);

        assertThat(saved.getId()).isNotNull();

        List<Property> all = propertyRepository.findAll();
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getTitre()).isEqualTo("Appartement 3 pièces Cocody");
        assertThat(all.get(0).getVille()).isEqualTo("Abidjan");
        assertThat(all.get(0).getPrix()).isEqualTo(250000.0);
    }
}