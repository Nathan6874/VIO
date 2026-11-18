package ci.vio.backend.admin;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyResponse;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ci.vio.backend.property.PropertyStatus;

import java.util.List;
import java.util.Map;

import static ci.vio.backend.admin.AdminDtos.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    public AdminController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

    @GetMapping("/stats")
    public AdminStatsDto getStats() {
        return adminService.getStats();
    }

    @GetMapping("/stats/revenue")
    public Map<String, Object> getRevenueStats() {
        return Map.of(
                "totalRevenueXof", adminService.getTotalRevenue(),
                "activeSubscriptions", adminService.getActiveSubscriptionsCount(),
                "totalSuccessPayments", adminService.getTotalSuccessPayments()
        );
    }

    @GetMapping("/properties")
    public List<PropertyResponse> getPending() {
        return adminService.findPendingProperties();
    }

    @PutMapping("/properties/{id}/approve")
    public PropertyResponse approve(@PathVariable Long id, Authentication auth) {
        return adminService.approve(id, getUser(auth));
    }

    @PutMapping("/properties/{id}/reject")
    public PropertyResponse reject(@PathVariable Long id, Authentication auth) {
        return adminService.reject(id, getUser(auth));
    }

    @GetMapping("/users")
    public List<AdminUserDto> findAllUsers() {
        return adminService.findAllUsers();
    }

    @PutMapping("/users/{id}/suspend")
    public AdminUserDto suspendUser(@PathVariable Long id,
                                    @RequestBody SuspendUserRequest request,
                                    Authentication auth) {
        return adminService.suspendUser(id, getUser(auth), request);
    }

    @PutMapping("/users/{id}/ban")
    public AdminUserDto banUser(@PathVariable Long id,
                                @RequestBody BanUserRequest request,
                                Authentication auth) {
        return adminService.banUser(id, getUser(auth), request);
    }

    @PutMapping("/users/{id}/reactivate")
    public AdminUserDto reactivateUser(@PathVariable Long id, Authentication auth) {
        return adminService.reactivateUser(id, getUser(auth));
    }

    @GetMapping("/reports")
    public List<ReportDto> findAllReports() {
        return adminService.findAllReports();
    }

    @PutMapping("/reports/{id}/resolve")
    public ReportDto resolveReport(@PathVariable Long id,
                                   @RequestBody ResolveReportRequest request,
                                   Authentication auth) {
        return adminService.resolveReport(id, getUser(auth), request);
    }

    @PutMapping("/reports/{id}/dismiss")
    public ReportDto dismissReport(@PathVariable Long id, Authentication auth) {
        return adminService.dismissReport(id, getUser(auth));
    }

    @GetMapping("/audit")
    public List<AuditLogDto> getAuditLogs() {
        return adminService.findRecentAuditLogs();
    }

    // === NOUVEAU : Paiements ===
    @GetMapping("/payments")
    public List<PaymentAdminDto> findAllPayments() {
        return adminService.findAllPayments();
    }

    // === NOUVEAU : Abonnements ===
    @GetMapping("/subscriptions")
    public List<SubscriptionAdminDto> findAllSubscriptions() {
        return adminService.findAllSubscriptions();
    }

    private User getUser(Authentication auth) {
        return userService.findByWhatsapp(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Admin introuvable"));
    }

    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePropertyNotFound(PropertyNotFoundException ex) {
        return ResponseEntity.status(404)
                .body(Map.of("error", "PropertyNotFound", "message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(400)
                .body(Map.of("error", "BadRequest", "message", ex.getMessage()));
    }

    // === NOUVEAU : Toutes les annonces avec filtre statut ===
    @GetMapping("/properties/all")
    public List<PropertyResponse> getAllProperties(
            @RequestParam(required = false) PropertyStatus status) {
        return adminService.findAllProperties(status);
    }

    // === NOUVEAU : Suspendre une annonce ===
    @PutMapping("/properties/{id}/suspend")
    public PropertyResponse suspendProperty(@PathVariable Long id,
                                            @RequestBody Map<String, String> body,
                                            Authentication auth) {
        String reason = body.getOrDefault("reason", "Non spécifiée");
        return adminService.suspendProperty(id, getUser(auth), reason);
    }

    // === NOUVEAU : Supprimer une annonce ===
    @DeleteMapping("/properties/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id, Authentication auth) {
        adminService.deleteProperty(id, getUser(auth));
        return ResponseEntity.noContent().build();
    }

    // === NOUVEAU : Supprimer un utilisateur ===
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication auth) {
        adminService.deleteUser(id, getUser(auth));
        return ResponseEntity.noContent().build();
    }
}