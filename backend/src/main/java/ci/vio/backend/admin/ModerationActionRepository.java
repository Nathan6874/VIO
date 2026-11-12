package ci.vio.backend.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationActionRepository extends JpaRepository<ModerationAction, Long> {

    List<ModerationAction> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);
}