import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { Media, MediaService } from '../services/media.service';
import { AuthService } from '../services/auth.service';
import { MediaUploadComponent } from '../media-upload/media-upload.component';
import { PanoramaViewerComponent } from '../panorama-viewer/panorama-viewer.component';
import { SceneService } from '../services/scene.service';
import { Hotspot, Scene } from '../models/scene.model';
import { SceneManagerComponent } from '../scene-manager/scene-manager.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUploadComponent, PanoramaViewerComponent, SceneManagerComponent],
  template: `
    <!-- Visite 3D multi-scènes (prioritaire si des scènes existent) -->
    @if (scenes().length > 0) {
      <div class="relative w-full h-screen bg-black">
        <app-panorama-viewer
          [scenes]="scenes()"
          [hotspotsByScene]="hotspotsByScene()"
          [backendBaseUrl]="'http://localhost:8087'" />

        <a routerLink="/" class="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-md backdrop-blur-sm transition z-30">
          ← Retour
        </a>

        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 pointer-events-none z-10">
          <h1 class="text-3xl md:text-5xl font-bold text-white">{{ property()?.titre }}</h1>
          <p class="text-xl text-white/80">{{ property()?.commune }}, {{ property()?.ville }}</p>
          <p class="text-2xl font-bold text-red-400 mt-2">{{ property()?.prix }} FCFA</p>
        </div>
      </div>
    }
    <!-- Fallback : ancien mode mono-scène si pas encore de scènes 3D mais un panorama legacy -->
    @else if (panoramaMedia()) {
      <div class="relative w-full h-screen bg-black">
        <app-panorama-viewer
          [scenes]="[legacyScene()]"
          [hotspotsByScene]="{}"
          [backendBaseUrl]="'http://localhost:8087'" />

        <a routerLink="/" class="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-md backdrop-blur-sm transition z-30">
          ← Retour
        </a>

        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 pointer-events-none z-10">
          <h1 class="text-3xl md:text-5xl font-bold text-white">{{ property()?.titre }}</h1>
          <p class="text-xl text-white/80">{{ property()?.commune }}, {{ property()?.ville }}</p>
          <p class="text-2xl font-bold text-red-400 mt-2">{{ property()?.prix }} FCFA</p>
        </div>
      </div>
    }

    <!-- Contenu scrollable -->
    <div class="min-h-screen bg-gray-50">
      @if (loading()) {
        <div class="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Chargement…</div>
      } @else if (error()) {
        <div class="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">{{ error() }}</div>
      } @else if (property()) {
        @let p = property()!;

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          @if (scenes().length === 0 && !panoramaMedia()) {
            <div class="mb-8">
              <h1 class="text-4xl font-bold text-gray-900">{{ p.titre }}</h1>
              <p class="text-lg text-gray-600">{{ p.commune }}, {{ p.ville }}</p>
            </div>
          }

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">

              <!-- Panneau de gestion des scènes 3D (owner uniquement) -->
              @if (isOwner()) {
                <app-scene-manager
                  [propertyId]="p.id"
                  (scenesChanged)="onScenesChanged($event)" />
              }

              <!-- Photos -->
              @if (photoMedia().length > 0) {
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-4">Photos</h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @for (m of photoMedia(); track m.id) {
                      <img [src]="'http://localhost:8087' + m.url"
                           alt="Photo du bien"
                           class="w-full h-72 object-cover rounded-lg shadow-sm hover:shadow-md transition" />
                    }
                  </div>
                </div>
              }

              <!-- Description -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p class="text-gray-700 leading-relaxed">{{ p.description }}</p>
              </div>

              <!-- Upload média legacy (photos) -->
              @if (isOwner()) {
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <button (click)="showUpload.set(!showUpload())"
                          class="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition">
                    {{ showUpload() ? "Masquer l'upload" : '+ Ajouter un média' }}
                  </button>
                  @if (showUpload()) {
                    <div class="mt-4">
                      <app-media-upload [propertyId]="p.id" (mediaUploaded)="onMediaUploaded($event)" />
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <p class="text-3xl font-bold text-red-600 mb-2">{{ p.prix }} FCFA</p>
                <p class="text-sm text-gray-500 mb-4">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
                <hr class="my-4" />
                <h3 class="text-sm font-semibold text-gray-600 mb-2">Propriétaire</h3>
                <p class="text-gray-900 font-medium">{{ p.owner.prenom }} {{ p.owner.nom }}</p>
                <p class="text-sm text-gray-500">{{ p.owner.whatsapp }}</p>
                <hr class="my-4" />
                <a [href]="'https://wa.me/' + p.owner.whatsapp.replace('+', '')"
                   target="_blank"
                   class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition">
                  Contacter via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </main>
      }
    </div>
  `
})
export class PropertyDetailComponent implements OnInit {

  property = signal<Property | null>(null);
  mediaList = signal<Media[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showUpload = signal(false);

  panoramaMedia = signal<Media | null>(null);
  photoMedia = signal<Media[]>([]);

  scenes = signal<Scene[]>([]);
  hotspotsByScene = signal<{ [sceneId: number]: Hotspot[] }>({});

  private route = inject(ActivatedRoute);
  private propertyService = inject(PropertyService);
  private mediaService = inject(MediaService);
  private sceneService = inject(SceneService);
  public authService = inject(AuthService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.propertyService.getPublicProperty(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.loading.set(false);
        this.loadScenes(id);
        this.mediaService.getMedia(id).subscribe({
          next: (media) => {
            this.mediaList.set(media);
            this.panoramaMedia.set(media.find(m => m.type === 'PANORAMA_360') || null);
            this.photoMedia.set(media.filter(m => m.type === 'PHOTO'));
          },
          error: (err) => console.error('Erreur chargement médias', err)
        });
      },
      error: (err) => {
        this.error.set('Annonce introuvable ou erreur serveur');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  private loadScenes(propertyId: number): void {
    this.sceneService.getScenesPublic(propertyId).subscribe({
      next: (scenes) => {
        if (scenes.length > 0) {
          this.applyScenes(scenes);
        } else if (this.isOwner()) {
          this.sceneService.getScenes(propertyId).subscribe({
            next: (ownerScenes) => this.applyScenes(ownerScenes),
            error: (err) => console.error('Erreur scènes (owner)', err)
          });
        } else {
          this.scenes.set([]);
          this.hotspotsByScene.set({});
        }
      },
      error: (err) => {
        if (this.isOwner()) {
          this.sceneService.getScenes(propertyId).subscribe({
            next: (ownerScenes) => this.applyScenes(ownerScenes),
            error: (e) => console.error('Erreur scènes (owner fallback)', e)
          });
        } else {
          console.error('Erreur chargement scènes', err);
          this.scenes.set([]);
        }
      }
    });
  }

  private applyScenes(scenes: Scene[]): void {
    this.scenes.set(scenes);
    if (scenes.length === 0) {
      this.hotspotsByScene.set({});
      return;
    }

    const map: { [sceneId: number]: Hotspot[] } = {};
    let pending = scenes.length;

    for (const scene of scenes) {
      this.sceneService.getHotspotsPublic(scene.id).subscribe({
        next: (hotspots) => {
          map[scene.id] = hotspots;
          pending--;
          if (pending === 0) this.hotspotsByScene.set(map);
        },
        error: () => {
          if (this.isOwner()) {
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
          } else {
            map[scene.id] = [];
            pending--;
            if (pending === 0) this.hotspotsByScene.set(map);
          }
        }
      });
    }
  }

  onScenesChanged(scenes: Scene[]): void {
    this.applyScenes(scenes);
  }

  isOwner(): boolean {
    const p = this.property();
    if (!p || !this.authService.isAuthenticated()) return false;
    return p.owner.whatsapp === this.authService.getWhatsapp();
  }

  legacyScene(): Scene {
    const p = this.property();
    const m = this.panoramaMedia();
    return {
      id: -1,
      propertyId: p?.id ?? 0,
      label: p?.titre ?? 'Panorama',
      panoramaUrl: m?.url ?? '',
      sceneOrder: 0,
      isMainScene: true,
      defaultYaw: 0,
      defaultPitch: 0,
      createdAt: ''
    };
  }

  onMediaUploaded(media: Media): void {
    this.mediaList.update(list => [...list, media]);
    if (media.type === 'PANORAMA_360') {
      this.panoramaMedia.set(media);
    } else {
      this.photoMedia.update(list => [...list, media]);
    }
  }
}