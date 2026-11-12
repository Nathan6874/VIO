package ci.vio.backend.subscription;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Transactional(readOnly = true)
    public List<PlanResponse> findAll() {
        return planRepository.findAll().stream()
                .sorted((a, b) -> a.getPriceXof().compareTo(b.getPriceXof()))
                .map(PlanResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Plan findByCode(String code) {
        return planRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Plan introuvable : " + code));
    }
}