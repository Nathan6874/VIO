package ci.vio.backend.subscription;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentRedirectController {

    /**
     * Jeko redirige ici après paiement réussi.
     * On redirige immédiatement l'utilisateur vers le frontend Angular.
     */
    @GetMapping("/redirect-success")
    public ResponseEntity<Void> redirectSuccess(
            @RequestParam(required = false) String reference) {
        String frontendUrl = "http://localhost:4200/owner/subscription/success";
        if (reference != null && !reference.isEmpty()) {
            frontendUrl += "?reference=" + reference;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", frontendUrl);
        return new ResponseEntity<>(headers, HttpStatus.FOUND); // 302
    }

    /**
     * Jeko redirige ici après paiement échoué.
     * On redirige immédiatement l'utilisateur vers le frontend Angular.
     */
    @GetMapping("/redirect-error")
    public ResponseEntity<Void> redirectError(
            @RequestParam(required = false) String reference) {
        String frontendUrl = "http://localhost:4200/owner/subscription/error";
        if (reference != null && !reference.isEmpty()) {
            frontendUrl += "?reference=" + reference;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", frontendUrl);
        return new ResponseEntity<>(headers, HttpStatus.FOUND); // 302
    }
}