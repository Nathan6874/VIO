package ci.vio.backend.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;
    private final ProfileService profileService;

    public ProfileController(UserService userService, ProfileService profileService) {
        this.userService = userService;
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        return ResponseEntity.ok(UserResponse.from(getUser(auth)));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> update(@RequestBody UpdateProfileRequest req, Authentication auth) {
        User user = getUser(auth);
        User updated = profileService.updateProfile(user, req.nom(), req.prenom());
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest req, Authentication auth) {
        profileService.changePassword(getUser(auth), req.newPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié"));
    }

    private User getUser(Authentication auth) {
        return userService.findByWhatsapp(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
    }

    public record UpdateProfileRequest(String nom, String prenom) {}
    public record ChangePasswordRequest(String newPassword) {}
}