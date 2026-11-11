export interface Scene {
  id: number;
  propertyId: number;
  label: string;
  panoramaUrl: string;
  sceneOrder: number;
  isMainScene: boolean;
  defaultYaw: number;
  defaultPitch: number;
  createdAt: string;
}

export interface Hotspot {
  id: number;
  sceneId: number;
  targetSceneId: number | null;
  hotspotType: string;   // 'NAVIGATION'
  label: string | null;
  yaw: number;
  pitch: number;
  createdAt: string;
}

export interface CreateSceneRequest {
  label: string;
  panoramaUrl: string;
  sceneOrder?: number;
  isMainScene?: boolean;
  defaultYaw?: number;
  defaultPitch?: number;
}

export interface CreateHotspotRequest {
  targetSceneId: number;
  label: string;
  yaw: number;
  pitch: number;
}