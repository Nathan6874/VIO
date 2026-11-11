package ci.vio.backend.scene;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, Long> {

    List<Hotspot> findBySceneId(Long sceneId);

    void deleteBySceneId(Long sceneId);
}