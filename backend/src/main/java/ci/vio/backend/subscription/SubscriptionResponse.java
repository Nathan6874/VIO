package ci.vio.backend.subscription;

import java.time.Instant;

public record SubscriptionResponse(
        Long id,
        String planCode,
        String planName,
        String status,
        Instant startDate,
        Instant endDate
) {
    public static SubscriptionResponse from(Subscription s) {
        return new SubscriptionResponse(
                s.getId(),
                s.getPlan().getCode(),
                s.getPlan().getName(),
                s.getStatus().name(),
                s.getStartDate(),
                s.getEndDate()
        );
    }
}