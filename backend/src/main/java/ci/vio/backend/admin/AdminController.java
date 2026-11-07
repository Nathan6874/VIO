package ci.vio.backend.admin;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/properties")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PropertyResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approve(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PropertyResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.reject(id));
    }

    @ExceptionHandler(PropertyNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePropertyNotFound(PropertyNotFoundException ex) {
        return ResponseEntity.status(404)
                .body(Map.of("error", "PropertyNotFound", "message", ex.getMessage()));
    }
}