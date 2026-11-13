package ci.vio.backend.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User updateProfile(User user, String nom, String prenom) {
        if (nom != null && !nom.trim().isEmpty()) user.setNom(nom.trim());
        if (prenom != null && !prenom.trim().isEmpty()) user.setPrenom(prenom.trim());
        return userRepository.save(user);
    }

    /**
     * Change le mot de passe SANS demander l'ancien.
     * L'utilisateur est déjà authentifié via JWT.
     */
    @Transactional
    public void changePassword(User user, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit faire au moins 6 caractères");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}