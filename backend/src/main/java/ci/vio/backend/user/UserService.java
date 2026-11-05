package ci.vio.backend.user;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User create(String nom, String prenom, String whatsapp) {
        User user = new User();
        user.setNom(nom);
        user.setPrenom(prenom);
        user.setWhatsapp(whatsapp);
        user.setCreatedAt(Instant.now());
        return userRepository.save(user);
    }
}