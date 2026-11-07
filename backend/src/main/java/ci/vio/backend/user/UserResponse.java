package ci.vio.backend.user;

import java.time.Instant;

public record UserResponse(
        Long id,
        String nom,
        String prenom,
        String whatsapp,
        UserRole role,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getWhatsapp(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}