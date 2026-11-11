package ci.vio.backend.scene;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SceneRepository extends JpaRepository<Scene, Long> {

    List<Scene> findByPropertyIdOrderBySceneOrderAsc(Long propertyId);

    long countByPropertyId(Long propertyId);
}