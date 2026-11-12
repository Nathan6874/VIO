package ci.vio.backend.auth;

import ci.vio.backend.security.JwtService;
import ci.vio.backend.user.DuplicateWhatsappException;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserResponse;
import ci.vio.backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.create(
                request.nom(),
                request.prenom(),
                request.whatsapp(),
                request.password()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(user));
    }

    @PostMapping("/register/client")
    public ResponseEntity<UserResponse> registerClient(@RequestBody RegisterRequest request) {
        User user = userService.createClient(
                request.nom(),
                request.prenom(),
                request.whatsapp(),
                request.password()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.whatsapp(), request.password())
        );

        // Récupérer le rôle depuis l'utilisateur
        User user = userService.findByWhatsapp(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable"));
        String token = jwtService.generateToken(authentication.getName(), user.getRole().name());

        return ResponseEntity.ok(new LoginResponse(token));
    }

    public record RegisterRequest(String nom, String prenom, String whatsapp, String password) {
    }

    public record LoginRequest(String whatsapp, String password) {
    }

    public record LoginResponse(String token) {
    }

    @ExceptionHandler(DuplicateWhatsappException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateWhatsapp(DuplicateWhatsappException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "DuplicateWhatsapp", "message", ex.getMessage()));
    }
}