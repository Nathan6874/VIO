package ci.vio.backend.subscription;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class JekoWebhookController {

    @Value("${jeko.webhook.secret}")
    private String webhookSecret;

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    public JekoWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "Jeko-Signature", required = false) String signature) {

        System.out.println(">>> WEBHOOK JEKO RECU");
        System.out.println(">>> Signature: " + signature);
        System.out.println(">>> Body: " + rawBody);

        // 1. Vérifier la signature HMAC-SHA256
        if (signature == null || !verifySignature(rawBody, signature)) {
            System.err.println(">>> SIGNATURE INVALIDE");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid signature"));
        }

        // 2. Parser le JSON (Jackson 3)
        try {
            JsonNode payload = objectMapper.readTree(rawBody);

            String status = payload.has("status") ? payload.get("status").asText() : null;
            String reference = null;
            if (payload.has("transactionDetails")
                    && payload.get("transactionDetails").has("reference")) {
                reference = payload.get("transactionDetails").get("reference").asText();
            }

            System.out.println(">>> Status: " + status + ", Reference: " + reference);

            // 3. Si succès, activer l'abonnement
            if ("success".equals(status) && reference != null) {
                paymentService.confirmByReference(reference);
                System.out.println(">>> Abonnement activé pour reference " + reference);
            }

            return ResponseEntity.ok(Map.of("status", "received"));

        } catch (Exception e) {
            System.err.println(">>> ERREUR PARSING WEBHOOK: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("status", "processed_with_error"));
        }
    }

    private boolean verifySignature(String body, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equalsIgnoreCase(signature);
        } catch (Exception e) {
            System.err.println(">>> ERREUR VERIF SIGNATURE: " + e.getMessage());
            return false;
        }
    }
}