package ci.vio.backend.admin;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.property.PropertyResponse;
import ci.vio.backend.property.PropertyStatus;
import ci.vio.backend.user.AccountStatus;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserRepository;
import ci.vio.backend.user.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static ci.vio.backend.admin.AdminDtos.*;

@Service
public class AdminService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final ModerationActionRepository moderationActionRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminService(PropertyRepository propertyRepository,
                        UserRepository userRepository,
                        ReportRepository reportRepository,
                        ModerationActionRepository moderationActionRepository,
                        AuditLogRepository auditLogRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.moderationActionRepository = moderationActionRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // === Annonces ===

    @Transactional
    public PropertyResponse approve(Long propertyId, User admin) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));
        property.setStatus(PropertyStatus.APPROVED);
        Property saved = propertyRepository.save(property);
        audit(admin, "APPROVE_PROPERTY", "PROPERTY", propertyId, null);
        return PropertyResponse.from(saved);
    }

    @Transactional
    public PropertyResponse reject(Long propertyId, User admin) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));
        property.setStatus(PropertyStatus.REJECTED);
        Property saved = propertyRepository.save(property);
        audit(admin, "REJECT_PROPERTY", "PROPERTY", propertyId, null);
        return PropertyResponse.from(saved);
    }

    @Transactional
    public PropertyResponse moderateProperty(Long propertyId, User admin,
                                             ModeratePropertyRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));
        property.setStatus(request.newStatus());
        Property saved = propertyRepository.save(property);
        ModerationAction action = new ModerationAction();
        action.setAdmin(admin);
        action.setTargetType("PROPERTY");
        action.setTargetId(propertyId);
        action.setAction("MODERATE_" + request.newStatus().name());
        action.setReason(request.reason());
        action.setCreatedAt(Instant.now());
        moderationActionRepository.save(action);
        audit(admin, "MODERATE_PROPERTY", "PROPERTY", propertyId, request.reason());
        return PropertyResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findPendingProperties() {
        return propertyRepository.findByStatus(PropertyStatus.PENDING)
                .stream()
                .map(PropertyResponse::from)
                .toList();
    }

    // === Utilisateurs ===

    @Transactional(readOnly = true)
    public List<AdminUserDto> findAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserDto(
                        u.getId(), u.getNom(), u.getPrenom(), u.getWhatsapp(),
                        u.getRole(), u.getAccountStatus(), u.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public AdminUserDto suspendUser(Long userId, User admin, SuspendUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + userId));
        user.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);

        ModerationAction action = new ModerationAction();
        action.setAdmin(admin);
        action.setTargetType("USER");
        action.setTargetId(userId);
        action.setAction("SUSPEND_USER");
        action.setReason(request.reason());
        action.setCreatedAt(Instant.now());
        moderationActionRepository.save(action);

        audit(admin, "SUSPEND_USER", "USER", userId, request.reason());
        return toAdminUser(user);
    }

    @Transactional
    public AdminUserDto banUser(Long userId, User admin, BanUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + userId));
        user.setAccountStatus(AccountStatus.BANNED);
        userRepository.save(user);

        ModerationAction action = new ModerationAction();
        action.setAdmin(admin);
        action.setTargetType("USER");
        action.setTargetId(userId);
        action.setAction("BAN_USER");
        action.setReason(request.reason());
        action.setCreatedAt(Instant.now());
        moderationActionRepository.save(action);

        audit(admin, "BAN_USER", "USER", userId, request.reason());
        return toAdminUser(user);
    }

    @Transactional
    public AdminUserDto reactivateUser(Long userId, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + userId));
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
        audit(admin, "REACTIVATE_USER", "USER", userId, null);
        return toAdminUser(user);
    }

    // === Signalements ===

    @Transactional(readOnly = true)
    public List<ReportDto> findAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toReportDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ReportDto> findOpenReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc("OPEN")
                .stream().map(this::toReportDto).toList();
    }

    @Transactional
    public ReportDto resolveReport(Long reportId, User admin, ResolveReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Signalement introuvable: " + reportId));
        report.setStatus("RESOLVED");
        report.setResolvedAt(Instant.now());
        report.setResolvedBy(admin);
        report.setResolution(request.resolution());
        Report saved = reportRepository.save(report);
        audit(admin, "RESOLVE_REPORT", "REPORT", reportId, request.resolution());
        return toReportDto(saved);
    }

    @Transactional
    public ReportDto dismissReport(Long reportId, User admin) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Signalement introuvable: " + reportId));
        report.setStatus("DISMISSED");
        report.setResolvedAt(Instant.now());
        report.setResolvedBy(admin);
        report.setResolution("Classé sans suite");
        Report saved = reportRepository.save(report);
        audit(admin, "DISMISS_REPORT", "REPORT", reportId, null);
        return toReportDto(saved);
    }

    // === Audit ===

    @Transactional(readOnly = true)
    public List<AuditLogDto> findRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(a -> new AuditLogDto(
                        a.getId(),
                        a.getAdmin().getId(),
                        a.getAdmin().getWhatsapp(),
                        a.getAction(),
                        a.getTargetType(),
                        a.getTargetId(),
                        a.getMetadata(),
                        a.getCreatedAt()
                ))
                .toList();
    }

    // === Stats ===

    @Transactional(readOnly = true)
    public AdminStatsDto getStats() {
        long totalUsers = userRepository.count();
        long totalOwners = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.OWNER).count();
        long totalClients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.CLIENT).count();
        long totalProperties = propertyRepository.count();
        long pending = propertyRepository.findByStatus(PropertyStatus.PENDING).size();
        long approved = propertyRepository.findByStatus(PropertyStatus.APPROVED).size();
        long rejected = propertyRepository.findByStatus(PropertyStatus.REJECTED).size();
        long openReports = reportRepository.countByStatus("OPEN");
        long totalReports = reportRepository.count();
        return new AdminStatsDto(totalUsers, totalOwners, totalClients,
                totalProperties, pending, approved, rejected, openReports, totalReports);
    }

    // === Helpers ===

    private void audit(User admin, String action, String targetType, Long targetId, String metadata) {
        AuditLog log = new AuditLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setMetadata(metadata);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }

    private AdminUserDto toAdminUser(User u) {
        return new AdminUserDto(u.getId(), u.getNom(), u.getPrenom(), u.getWhatsapp(),
                u.getRole(), u.getAccountStatus(), u.getCreatedAt());
    }

    private ReportDto toReportDto(Report r) {
        return new ReportDto(
                r.getId(),
                r.getProperty() != null ? r.getProperty().getId() : null,
                r.getProperty() != null ? r.getProperty().getTitre() : null,
                r.getReporter() != null ? r.getReporter().getId() : null,
                r.getReporter() != null ? r.getReporter().getWhatsapp() : null,
                r.getReason(),
                r.getDescription(),
                r.getStatus(),
                r.getCreatedAt(),
                r.getResolvedAt(),
                r.getResolution()
        );
    }
}