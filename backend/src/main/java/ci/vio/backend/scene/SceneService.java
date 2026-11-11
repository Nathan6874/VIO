package ci.vio.backend.scene;

import ci.vio.backend.property.Property;
import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyRepository;
import ci.vio.backend.property.PropertyStatus;
import ci.vio.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final HotspotRepository hotspotRepository;
    private final PropertyRepository propertyRepository;

    public SceneService(SceneRepository sceneRepository,
                        HotspotRepository hotspotRepository,
                        PropertyRepository propertyRepository) {
        this.sceneRepository = sceneRepository;
        this.hotspotRepository = hotspotRepository;
        this.propertyRepository = propertyRepository;
    }

    @Transactional
    public SceneResponse createScene(Long propertyId, User currentUser, SceneRequest request) {
        Property property = getOwnedProperty(propertyId, currentUser);

        long existingScenes = sceneRepository.countByPropertyId(propertyId);
        boolean isMain = request.isMainScene() != null ? request.isMainScene() : existingScenes == 0;

        if (isMain && existingScenes > 0) {
            sceneRepository.findByPropertyIdOrderBySceneOrderAsc(propertyId).forEach(s -> {
                if (Boolean.TRUE.equals(s.getIsMainScene())) {
                    s.setIsMainScene(false);
                    sceneRepository.save(s);
                }
            });
        }

        Scene scene = new Scene();
        scene.setProperty(property);
        scene.setLabel(request.label());
        scene.setPanoramaUrl(request.panoramaUrl());
        scene.setSceneOrder(request.sceneOrder() != null ? request.sceneOrder() : (int) existingScenes);
        scene.setIsMainScene(isMain);
        scene.setDefaultYaw(request.defaultYaw() != null ? request.defaultYaw() : 0.0);
        scene.setDefaultPitch(request.defaultPitch() != null ? request.defaultPitch() : 0.0);
        scene.setCreatedAt(Instant.now());

        return SceneResponse.from(sceneRepository.save(scene));
    }

    @Transactional(readOnly = true)
    public List<SceneResponse> findScenesByProperty(Long propertyId, User currentUser) {
        getOwnedProperty(propertyId, currentUser);
        return sceneRepository.findByPropertyIdOrderBySceneOrderAsc(propertyId)
                .stream()
                .map(SceneResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SceneResponse> findScenesByPropertyPublic(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));
        if (property.getStatus() != PropertyStatus.APPROVED) {
            throw new PropertyNotFoundException(propertyId);
        }
        return sceneRepository.findByPropertyIdOrderBySceneOrderAsc(propertyId)
                .stream()
                .map(SceneResponse::from)
                .toList();
    }

    @Transactional
    public void deleteScene(Long sceneId, User currentUser) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new SceneNotFoundException(sceneId));
        checkOwner(scene, currentUser);
        hotspotRepository.findBySceneId(sceneId).forEach(hotspotRepository::delete);
        sceneRepository.delete(scene);
    }

    @Transactional
    public HotspotResponse createHotspot(Long sceneId, User currentUser, HotspotRequest request) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new SceneNotFoundException(sceneId));
        checkOwner(scene, currentUser);

        Scene target = null;
        if (request.targetSceneId() != null) {
            target = sceneRepository.findById(request.targetSceneId())
                    .orElseThrow(() -> new SceneNotFoundException(request.targetSceneId()));
            if (!target.getProperty().getId().equals(scene.getProperty().getId())) {
                throw new IllegalArgumentException("La scene cible n'appartient pas a la meme propriete");
            }
        }

        Hotspot hotspot = new Hotspot();
        hotspot.setScene(scene);
        hotspot.setTargetScene(target);
        hotspot.setHotspotType(HotspotType.NAVIGATION);
        hotspot.setLabel(request.label());
        hotspot.setYaw(request.yaw());
        hotspot.setPitch(request.pitch());
        hotspot.setCreatedAt(Instant.now());

        return HotspotResponse.from(hotspotRepository.save(hotspot));
    }

    @Transactional(readOnly = true)
    public List<HotspotResponse> findHotspotsByScene(Long sceneId, User currentUser) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new SceneNotFoundException(sceneId));
        checkOwner(scene, currentUser);
        return hotspotRepository.findBySceneId(sceneId)
                .stream()
                .map(HotspotResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HotspotResponse> findHotspotsByScenePublic(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new SceneNotFoundException(sceneId));
        if (scene.getProperty() == null
                || scene.getProperty().getStatus() != PropertyStatus.APPROVED) {
            throw new SceneNotFoundException(sceneId);
        }
        return hotspotRepository.findBySceneId(sceneId)
                .stream()
                .map(HotspotResponse::from)
                .toList();
    }

    private Property getOwnedProperty(Long propertyId, User currentUser) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));
        if (property.getOwner() == null
                || !property.getOwner().getId().equals(currentUser.getId())) {
            throw new PropertyNotFoundException(propertyId);
        }
        return property;
    }

    private void checkOwner(Scene scene, User currentUser) {
        if (scene.getProperty() == null
                || scene.getProperty().getOwner() == null
                || !scene.getProperty().getOwner().getId().equals(currentUser.getId())) {
            throw new SceneNotFoundException(scene.getId());
        }
    }
}