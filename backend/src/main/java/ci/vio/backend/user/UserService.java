package ci.vio.backend.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User create(String nom, String prenom, String whatsapp, String password) {

        if(userRepository.findByWhatsapp(whatsapp).isPresent()){
            throw new DuplicateWhatsappException(whatsapp);
        }
        User user = new User();
        user.setNom(nom);
        user.setPrenom(prenom);
        user.setWhatsapp(whatsapp);
        user.setPassword(passwordEncoder.encode(password));
        user.setCreatedAt(Instant.now());
        return userRepository.save(user);
    }

    public Optional<User> findByWhatsapp(String whatsapp) {
        return userRepository.findByWhatsapp(whatsapp);
    }
}