package ci.vio.backend.subscription;

import ci.vio.backend.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JekoService {

    @Value("${jeko.api.base-url:https://api.jeko.africa}")
    private String jekoBaseUrl;

    @Value("${jeko.api.key}")
    private String apiKey;

    @Value("${jeko.api.key-id}")
    private String apiKeyId;

    @Value("${jeko.store-id}")
    private String storeId;

    @Value("${jeko.success-url}")
    private String successUrl;

    @Value("${jeko.error-url}")
    private String errorUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Crée une demande de paiement Jeko.
     * Retourne un objet avec l'URL de redirection vers la page de paiement Jeko.
     */
    public JekoPaymentResponse initiatePayment(Plan plan, User user, Long paymentId) {
        String url = jekoBaseUrl + "/partner_api/payment_requests";

        String reference = "VIO-" + paymentId + "-" + UUID.randomUUID().toString().substring(0, 8);

        Map<String, Object> body = new HashMap<>();
        body.put("storeId", storeId);
        body.put("amountCents", plan.getPriceXof() * 100);
        body.put("currency", "XOF");
        body.put("reference", reference);
        body.put("paymentDetails", Map.of(
                "type", "redirect",
                "data", Map.of(
                        "paymentMethod", "wave",                          // ← AJOUT : wave par défaut
                        "successUrl", successUrl,  // ← HTTPS
                        "errorUrl", errorUrl       // ← HTTPS
                )
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-KEY", apiKey);
        headers.set("X-API-KEY-ID", apiKeyId);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            Map responseBody = response.getBody();

            if (responseBody == null || !responseBody.containsKey("redirectUrl")) {
                throw new RuntimeException("Réponse Jeko invalide : pas de redirectUrl");
            }

            return new JekoPaymentResponse(
                    (String) responseBody.get("id"),
                    reference,
                    (String) responseBody.get("redirectUrl"),
                    (String) responseBody.get("status"),
                    (String) responseBody.get("paymentMethod")
            );

        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erreur Jeko : " + e.getStatusCode() + " — " + e.getResponseBodyAsString());
        }
    }

    public record JekoPaymentResponse(
            String jekoPaymentId,
            String reference,
            String redirectUrl,
            String status,
            String paymentMethod
    ) {}
}