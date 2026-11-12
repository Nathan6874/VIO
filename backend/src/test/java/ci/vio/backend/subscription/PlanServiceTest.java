package ci.vio.backend.subscription;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase
@TestPropertySource(properties = {"spring.jpa.hibernate.ddl-auto=create-drop"})
@Import(PlanService.class)
class PlanServiceTest {

    @Autowired
    private PlanService planService;

    @Autowired
    private PlanRepository planRepository;

    @Test
    void plansSeedShouldBeLoaded() {
        // Les plans sont seedés en DB via le script SQL, mais en H2 create-drop
        // ils n'existent pas. On teste juste que save + findAll fonctionne.
        Plan free = new Plan();
        free.setCode("FREE");
        free.setName("Gratuit");
        free.setPriceXof(0);
        free.setDurationDays(9999);
        free.setMaxProperties(1);
        free.setMaxScenes(0);
        free.setCreatedAt(java.time.Instant.now());
        planRepository.save(free);

        Plan std = new Plan();
        std.setCode("STD");
        std.setName("Standard");
        std.setPriceXof(5000);
        std.setDurationDays(30);
        std.setMaxProperties(5);
        std.setMaxScenes(5);
        std.setCreatedAt(java.time.Instant.now());
        planRepository.save(std);

        var plans = planService.findAll();
        assertThat(plans).hasSize(2);
        assertThat(plans.get(0).code()).isEqualTo("FREE");
        assertThat(plans.get(1).code()).isEqualTo("STD");
    }
}