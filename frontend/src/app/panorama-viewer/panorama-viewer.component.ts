import {
  Component, ElementRef, Input, OnChanges, OnDestroy, OnInit,
  SimpleChanges, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotspot, Scene } from '../models/scene.model';

declare var pannellum: any;

@Component({
  selector: 'app-panorama-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewer-wrapper">
      <div #viewerContainer class="viewer-container"></div>

      <!-- Sélecteur de pièce (tabs) -->
      @if (scenes.length > 1) {
        <div class="scene-tabs">
          @for (scene of scenes; track scene.id) {
            <button
              type="button"
              class="scene-tab"
              [class.active]="currentSceneId === scene.id"
              (click)="goToScene(scene)">
              {{ scene.label }}
            </button>
          }
        </div>
      }

      <!-- Titre de la pièce en cours -->
      @if (currentScene) {
        <div class="scene-label">
          {{ currentScene.label }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .viewer-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
    }
    .viewer-container {
      width: 100%;
      height: 100%;
    }
    .scene-tabs {
      position: absolute;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.6);
      padding: 0.5rem;
      border-radius: 9999px;
      backdrop-filter: blur(8px);
      z-index: 20;
    }
    .scene-tab {
      background: transparent;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }
    .scene-tab:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .scene-tab.active {
      background: #2563eb;
      color: white;
    }
    .scene-label {
      position: absolute;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      background: rgba(0, 0, 0, 0.5);
      padding: 0.25rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      z-index: 20;
      backdrop-filter: blur(4px);
    }
  `]
})
export class PanoramaViewerComponent implements OnInit, OnChanges, OnDestroy {

  /** Toutes les scènes de la propriété (chargées par le parent) */
  @Input() scenes: Scene[] = [];

  /** URL de base du backend (ex: http://localhost:8087) pour préfixer les URLs /uploads/... */
  @Input() backendBaseUrl: string = 'http://localhost:8087';

  /** Map sceneId -> hotspots[] (chargée par le parent ou par ce composant) */
  @Input() hotspotsByScene: { [sceneId: number]: Hotspot[] } = {};

  @ViewChild('viewerContainer', { static: true }) viewerContainer!: ElementRef<HTMLDivElement>;

  currentSceneId: number | null = null;
  currentScene: Scene | null = null;

  private viewer: any = null;

  ngOnInit(): void {
    // Le viewer sera initialisé dès que les scènes seront disponibles
    if (this.scenes.length > 0) {
      this.initWithMainScene();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scenes'] && this.scenes.length > 0 && !this.viewer) {
      this.initWithMainScene();
    }
    if (changes['hotspotsByScene'] && this.viewer) {
      this.rebuildScenes();
    }
  }

  ngOnDestroy(): void {
    this.destroyViewer();
  }

  goToScene(scene: Scene): void {
    if (!this.viewer) return;
    this.currentSceneId = scene.id;
    this.currentScene = scene;
    this.viewer.loadScene(String(scene.id));
  }

  private initWithMainScene(): void {
    const main = this.scenes.find(s => s.isMainScene) ?? this.scenes[0];
    if (!main) return;
    this.currentSceneId = main.id;
    this.currentScene = main;
    this.createViewer(main);
  }

  private createViewer(initialScene: Scene): void {
    if (typeof pannellum === 'undefined') {
      console.error('Pannellum non chargé');
      return;
    }

    const config = this.buildMultiSceneConfig(initialScene);
    this.viewer = pannellum.viewer(this.viewerContainer.nativeElement, config);

    // Synchroniser currentScene quand Pannellum change de scène
    this.viewer.on('scenechange', (sceneId: string) => {
      const id = Number(sceneId);
      const scene = this.scenes.find(s => s.id === id);
      if (scene) {
        this.currentSceneId = scene.id;
        this.currentScene = scene;
      }
    });
  }

  private buildMultiSceneConfig(initialScene: Scene): any {
    const scenes: any = {};

    for (const scene of this.scenes) {
      const hotspots = (this.hotspotsByScene[scene.id] ?? [])
        .filter(h => h.hotspotType === 'NAVIGATION' && h.targetSceneId != null)
        .map(h => ({
          pitch: h.pitch,
          yaw: h.yaw,
          type: 'scene',
          text: h.label ?? '→',
          sceneId: String(h.targetSceneId)
        }));

      scenes[String(scene.id)] = {
        type: 'equirectangular',
        panorama: this.resolveUrl(scene.panoramaUrl),
        autoLoad: true,
        autoRotate: -1.5,
        compass: false,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        yaw: scene.defaultYaw ?? 0,
        pitch: scene.defaultPitch ?? 0,
        hotSpots: hotspots
      };
    }

    return {
      default: {
        firstScene: String(initialScene.id),
        sceneFadeDuration: 800,
        autoLoad: true
      },
      scenes
    };
  }

  private rebuildScenes(): void {
    // Si les hotspots changent, on recrée le viewer avec la scène courante
    const keepId = this.currentSceneId;
    this.destroyViewer();
    const scene = this.scenes.find(s => s.id === keepId) ?? this.scenes[0];
    if (scene) {
      this.currentSceneId = scene.id;
      this.currentScene = scene;
      this.createViewer(scene);
    }
  }

  private resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return this.backendBaseUrl + url;
  }

  private destroyViewer(): void {
    if (this.viewer) {
      try { this.viewer.destroy(); } catch (e) { /* ignore */ }
      this.viewer = null;
    }
  }
}