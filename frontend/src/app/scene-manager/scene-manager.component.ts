import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaService } from '../services/media.service';
import { SceneService } from '../services/scene.service';
import {
  CreateHotspotRequest,
  CreateSceneRequest,
  Hotspot,
  Scene
} from '../models/scene.model';

@Component({
  selector: 'app-scene-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Visite 3D</h2>
        <button
          (click)="toggleAddScene()"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition">
          {{ showAddScene() ? 'Annuler' : '+ Nouvelle scène' }}
        </button>
      </div>

      <!-- Formulaire ajout scène -->
      @if (showAddScene()) {
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
          <h3 class="font-semibold text-blue-900">Nouvelle scène</h3>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Label (ex: Salon, Cuisine)</label>
            <input
              type="text"
              [(ngModel)]="newScene.label"
              placeholder="Salon"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Panorama (image 360°)</label>
            <input
              type="file"
              accept="image/*"
              (change)="onFileSelected($event)"
              class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="newScene.isMainScene" id="mainScene" class="w-4 h-4" />
            <label for="mainScene" class="text-sm text-gray-700">Scène principale (affichée en premier)</label>
          </div>

          @if (uploadError()) {
            <p class="text-sm text-red-600">{{ uploadError() }}</p>
          }

          <button
            (click)="createScene()"
            [disabled]="uploading() || !newScene.label || !selectedFile"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition">
            {{ uploading() ? 'Upload en cours…' : 'Créer la scène' }}
          </button>
        </div>
      }

      <!-- Liste des scènes -->
      @if (scenes().length === 0) {
        <p class="text-gray-500 text-sm italic">Aucune scène pour le moment.</p>
      } @else {
        <div class="space-y-3">
          @for (scene of scenes(); track scene.id) {
            <div class="border border-gray-200 rounded-lg p-3 flex justify-between items-start gap-3">
              <div class="flex-1">
                <p class="font-medium text-gray-900">
                  {{ scene.label }}
                  @if (scene.isMainScene) {
                    <span class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Principale</span>
                  }
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ scene.panoramaUrl }}</p>
                <p class="text-xs text-gray-500">{{ hotspotCount(scene.id) }} hotspot(s)</p>

                <!-- Hotspots existants -->
                @if (hotspotsOf(scene.id).length > 0) {
                  <div class="mt-2 space-y-1">
                    @for (h of hotspotsOf(scene.id); track h.id) {
                      <p class="text-xs text-gray-600">
                        → {{ h.label }} (vers scene #{{ h.targetSceneId }}, yaw={{ h.yaw }}, pitch={{ h.pitch }})
                      </p>
                    }
                  </div>
                }
              </div>
              <div class="flex flex-col gap-2">
                <button
                  (click)="openHotspotForm(scene.id)"
                  class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition">
                  + Hotspot
                </button>
                <button
                  (click)="deleteScene(scene)"
                  class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition">
                  Supprimer
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Formulaire hotspot -->
      @if (hotspotFormSceneId() !== null) {
        <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 class="font-semibold text-green-900">Nouveau hotspot depuis "{{ sceneLabel(hotspotFormSceneId()!) }}"</h3>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Scène cible</label>
            <select
              [(ngModel)]="newHotspot.targetSceneId"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option [ngValue]="null">— Choisir —</option>
              @for (s of otherScenes(hotspotFormSceneId()!); track s.id) {
                <option [ngValue]="s.id">{{ s.label }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Label du hotspot</label>
            <input
              type="text"
              [(ngModel)]="newHotspot.label"
              placeholder="Aller à la cuisine"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Yaw (-180 à 180)</label>
              <input type="number" [(ngModel)]="newHotspot.yaw" step="1"
                     class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pitch (-90 à 90)</label>
              <input type="number" [(ngModel)]="newHotspot.pitch" step="1"
                     class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <p class="text-xs text-gray-500 italic">
            Astuce : yaw=0 = face, yaw=90 = à droite, yaw=-90 = à gauche. pitch=0 = horizon, pitch=20 = en haut.
          </p>

          @if (hotspotError()) {
            <p class="text-sm text-red-600">{{ hotspotError() }}</p>
          }

          <div class="flex gap-2">
            <button
              (click)="createHotspot()"
              [disabled]="newHotspot.targetSceneId === null || !newHotspot.label"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition">
              Créer le hotspot
            </button>
            <button
              (click)="closeHotspotForm()"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-md transition">
              Annuler
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class SceneManagerComponent implements OnInit {

  @Input() propertyId!: number;
  @Output() scenesChanged = new EventEmitter<Scene[]>();

  private mediaService = inject(MediaService);
  private sceneService = inject(SceneService);

  scenes = signal<Scene[]>([]);
  hotspotsByScene = signal<{ [sceneId: number]: Hotspot[] }>({});

  showAddScene = signal(false);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  selectedFile: File | null = null;

  newScene = {
    label: '',
    isMainScene: false
  };

  hotspotFormSceneId = signal<number | null>(null);
  hotspotError = signal<string | null>(null);
  newHotspot: CreateHotspotRequest & { yaw: number; pitch: number } = {
    targetSceneId: null as any,
    label: '',
    yaw: 0,
    pitch: 0
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.sceneService.getScenes(this.propertyId).subscribe({
      next: (scenes) => {
        this.scenes.set(scenes);
        this.scenesChanged.emit(scenes);
        this.loadHotspots(scenes);
      },
      error: (err) => console.error('Erreur chargement scènes', err)
    });
  }

  private loadHotspots(scenes: Scene[]): void {
    const map: { [sceneId: number]: Hotspot[] } = {};
    let pending = scenes.length;
    if (pending === 0) {
      this.hotspotsByScene.set({});
      return;
    }
    for (const scene of scenes) {
      this.sceneService.getHotspots(scene.id).subscribe({
        next: (hotspots) => {
          map[scene.id] = hotspots;
          pending--;
          if (pending === 0) this.hotspotsByScene.set(map);
        },
        error: () => {
          map[scene.id] = [];
          pending--;
          if (pending === 0) this.hotspotsByScene.set(map);
        }
      });
    }
  }

  toggleAddScene(): void {
    this.showAddScene.update(v => !v);
    this.uploadError.set(null);
    if (this.showAddScene()) {
      this.newScene = { label: '', isMainScene: false };
      this.selectedFile = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  createScene(): void {
    if (!this.selectedFile || !this.newScene.label.trim()) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    // Étape 1 : upload du fichier via MediaService (renvoie { url: "/uploads/xxx.jpg" })
    this.mediaService.uploadMedia(this.propertyId, this.selectedFile, 'PANORAMA_360').subscribe({
      next: (media) => {
        // Étape 2 : création de la scène avec l'URL retournée
        const payload: CreateSceneRequest = {
          label: this.newScene.label.trim(),
          panoramaUrl: media.url,
          sceneOrder: this.scenes().length,
          isMainScene: this.newScene.isMainScene || this.scenes().length === 0,
          defaultYaw: 0,
          defaultPitch: 0
        };
        this.sceneService.createScene(this.propertyId, payload).subscribe({
          next: () => {
            this.uploading.set(false);
            this.showAddScene.set(false);
            this.newScene = { label: '', isMainScene: false };
            this.selectedFile = null;
            this.loadAll();
          },
          error: (err) => {
            this.uploading.set(false);
            this.uploadError.set('Erreur lors de la création de la scène');
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set("Erreur lors de l'upload du fichier");
        console.error(err);
      }
    });
  }

  deleteScene(scene: Scene): void {
    if (!confirm(`Supprimer la scène "${scene.label}" et ses hotspots ?`)) return;
    this.sceneService.deleteScene(scene.id).subscribe({
      next: () => this.loadAll(),
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression');
      }
    });
  }

  openHotspotForm(sceneId: number): void {
    this.hotspotFormSceneId.set(sceneId);
    this.hotspotError.set(null);
    this.newHotspot = { targetSceneId: null as any, label: '', yaw: 0, pitch: 0 };
  }

  closeHotspotForm(): void {
    this.hotspotFormSceneId.set(null);
    this.hotspotError.set(null);
  }

  createHotspot(): void {
    const sceneId = this.hotspotFormSceneId();
    if (sceneId === null || this.newHotspot.targetSceneId === null) return;

    const payload: CreateHotspotRequest = {
      targetSceneId: this.newHotspot.targetSceneId,
      label: this.newHotspot.label.trim(),
      yaw: this.newHotspot.yaw,
      pitch: this.newHotspot.pitch
    };

    this.sceneService.createHotspot(sceneId, payload).subscribe({
      next: () => {
        this.closeHotspotForm();
        this.loadAll();
      },
      error: (err) => {
        this.hotspotError.set('Erreur lors de la création du hotspot');
        console.error(err);
      }
    });
  }

  hotspotsOf(sceneId: number): Hotspot[] {
    return this.hotspotsByScene()[sceneId] ?? [];
  }

  hotspotCount(sceneId: number): number {
    return this.hotspotsOf(sceneId).length;
  }

  otherScenes(currentSceneId: number): Scene[] {
    return this.scenes().filter(s => s.id !== currentSceneId);
  }

  sceneLabel(sceneId: number): string {
    const s = this.scenes().find(x => x.id === sceneId);
    return s ? s.label : `#${sceneId}`;
  }
}