package ci.vio.backend.admin;

import ci.vio.backend.property.PropertyStatus;
import ci.vio.backend.user.AccountStatus;
import ci.vio.backend.user.UserRole;

import java.time.Instant;

public class AdminDtos {

    // === Users ===
    public record AdminUserDto(
            Long id,
            String nom,
            String prenom,
            String whatsapp,
            UserRole role,
            AccountStatus accountStatus,
            Instant createdAt
    ) {}

    public record SuspendUserRequest(String reason) {}
    public record BanUserRequest(String reason) {}
    public record ReactivateUserRequest() {}

    // === Reports ===
    public record ReportDto(
            Long id,
            Long propertyId,
            String propertyTitre,
            Long reporterId,
            String reporterWhatsapp,
            String reason,
            String description,
            String status,
            Instant createdAt,
            Instant resolvedAt,
            String resolution
    ) {}

    public record ResolveReportRequest(String resolution) {}
    public record DismissReportRequest() {}

    // === Moderation ===
    public record ModeratePropertyRequest(String reason, PropertyStatus newStatus) {}

    // === Audit ===
    public record AuditLogDto(
            Long id,
            Long adminId,
            String adminWhatsapp,
            String action,
            String targetType,
            Long targetId,
            String metadata,
            Instant createdAt
    ) {}

    // === Stats ===
    public record AdminStatsDto(
            long totalUsers,
            long totalOwners,
            long totalClients,
            long totalProperties,
            long pendingProperties,
            long approvedProperties,
            long rejectedProperties,
            long openReports,
            long totalReports
    ) {}
}