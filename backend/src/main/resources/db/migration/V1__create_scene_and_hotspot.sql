-- V1 : Visite 3D multi-scenes
-- Chaque Property possede 0..N Scene. Chaque Scene possede 0..N Hotspot.
-- Un Hotspot de type NAVIGATION pointe vers une autre Scene de la meme Property.

CREATE TABLE scene (
    id              BIGSERIAL PRIMARY KEY,
    property_id     BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    label           VARCHAR(100) NOT NULL,
    panorama_url    VARCHAR(500) NOT NULL,
    scene_order     INTEGER NOT NULL DEFAULT 0,
    is_main_scene   BOOLEAN NOT NULL DEFAULT FALSE,
    default_yaw     DOUBLE PRECISION DEFAULT 0,
    default_pitch   DOUBLE PRECISION DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scene_property ON scene(property_id);

CREATE TABLE hotspot (
    id                BIGSERIAL PRIMARY KEY,
    scene_id          BIGINT NOT NULL REFERENCES scene(id) ON DELETE CASCADE,
    target_scene_id   BIGINT REFERENCES scene(id) ON DELETE CASCADE,
    hotspot_type      VARCHAR(20) NOT NULL DEFAULT 'NAVIGATION',
    label             VARCHAR(100),
    yaw               DOUBLE PRECISION NOT NULL,
    pitch             DOUBLE PRECISION NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotspot_scene ON hotspot(scene_id);
