package ci.vio.backend.subscription;

public record PlanResponse(
        Long id,
        String code,
        String name,
        Integer priceXof,
        Integer durationDays,
        Integer maxProperties,
        Integer maxScenes,
        String description
) {
    public static PlanResponse from(Plan p) {
        return new PlanResponse(
                p.getId(), p.getCode(), p.getName(), p.getPriceXof(),
                p.getDurationDays(), p.getMaxProperties(), p.getMaxScenes(),
                p.getDescription()
        );
    }
}