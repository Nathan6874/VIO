package ci.vio.backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Import({UserService.class, UserServiceTest.TestConfig.class})
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }

    @Test
    void createUserWithUniqueWhatsappShouldSucceed() {
        User user = userService.create("Koffi", "Jean", "+22501020304", "motdepasse1");

        assertThat(user.getId()).isNotNull();
        assertThat(user.getWhatsapp()).isEqualTo("+22501020304");
        assertThat(userRepository.findByWhatsapp("+22501020304")).isPresent();
    }

    @Test
    void createUserWithDuplicateWhatsappShouldThrowException() {
        userService.create("Koffi", "Jean", "+22501020304", "motdepasse1");

        assertThatThrownBy(() ->
                userService.create("Autre", "Personne", "+22501020304", "autre1234")
        ).isInstanceOf(DuplicateWhatsappException.class)
                .hasMessageContaining("+22501020304");
    }
}