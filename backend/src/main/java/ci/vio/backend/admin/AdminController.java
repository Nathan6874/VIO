package ci.vio.backend.admin;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyResponse;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    // === Stats ===

    @GetMapping("/stats")
    public AdminStatsDto getStats() {
        return adminService.getStats();
    }

    // === Annonces ===

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

    @PutMapping("/properties/{id}/moderate")
    public PropertyResponse moderate(@PathVariable Long id,
                                     @RequestBody ModeratePropertyRequest request,
                                     Authentication auth) {
        return adminService.moderateProperty(id, getUser(auth), request);
    }

    // === Users ===

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

    // === Reports ===

    @GetMapping("/reports")
    public List<ReportDto> findAllReports() {
        return adminService.findAllReports();
    }

    @GetMapping("/reports/open")
    public List<ReportDto> findOpenReports() {
        return adminService.findOpenReports();
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

    // === Audit ===

    @GetMapping("/audit")
    public List<AuditLogDto> getAuditLogs() {
        return adminService.findRecentAuditLogs();
    }

    // === Helpers ===

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
}