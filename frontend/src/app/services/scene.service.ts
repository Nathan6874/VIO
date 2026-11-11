import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateHotspotRequest,
  CreateSceneRequest,
  Hotspot,
  Scene
} from '../models/scene.model';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {
  }

  // === Owner (authentifié) ===

  getScenes(propertyId: number): Observable<Scene[]> {
    return this.http.get<Scene[]>(`${this.apiUrl}/properties/${propertyId}/scenes`);
  }

  createScene(propertyId: number, data: CreateSceneRequest): Observable<Scene> {
    return this.http.post<Scene>(`${this.apiUrl}/properties/${propertyId}/scenes`, data);
  }

  deleteScene(sceneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scenes/${sceneId}`);
  }

  getHotspots(sceneId: number): Observable<Hotspot[]> {
    return this.http.get<Hotspot[]>(`${this.apiUrl}/scenes/${sceneId}/hotspots`);
  }

  createHotspot(sceneId: number, data: CreateHotspotRequest): Observable<Hotspot> {
    return this.http.post<Hotspot>(`${this.apiUrl}/scenes/${sceneId}/hotspots`, data);
  }

  // === Public (visiteur) ===

  getScenesPublic(propertyId: number): Observable<Scene[]> {
    return this.http.get<Scene[]>(`${this.apiUrl}/properties/${propertyId}/scenes/public`);
  }

  getHotspotsPublic(sceneId: number): Observable<Hotspot[]> {
    return this.http.get<Hotspot[]>(`${this.apiUrl}/scenes/${sceneId}/hotspots/public`);
  }
}