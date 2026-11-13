import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideAngularModule, Compass, Heart, ArrowLeft, ChevronLeft, ChevronRight,
  Maximize2, Image as ImageIcon, X, Play, Camera, MapPin
} from 'lucide-angular';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { Media, MediaService } from '../services/media.service';
import { AuthService } from '../services/auth.service';
import { MediaUploadComponent } from '../media-upload/media-upload.component';
import { PanoramaViewerComponent } from '../panorama-viewer/panorama-viewer.component';
import { SceneService } from '../services/scene.service';
import { Hotspot, Scene } from '../models/scene.model';
import { SceneManagerComponent } from '../scene-manager/scene-manager.component';
import { FavoriteService } from '../services/favorite.service';
import { ImageLightboxComponent } from '../image-lightbox/image-lightbox.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, LucideAngularModule,
    MediaUploadComponent, PanoramaViewerComponent, SceneManagerComponent,
    ImageLightboxComponent
  ],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950">

      <!-- Breadcrumb -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <a routerLink="/" class="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium">
          <lucide-icon [img]="icons.ArrowLeft" class="w-4 h-4"></lucide-icon>
          Retour aux annonces
        </a>
      </div>

      @if (loading()) {
        <div class="max-w-7xl mx-auto px-4 py-12 text-center text-stone-500">Chargement…</div>
      } @else if (error()) {
        <div class="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">{{ error() }}</div>
      } @else if (property()) {
        @let p = property()!;

        <!-- ═══════════ SECTION PRINCIPALE ═══════════ -->
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">

            <!-- Colonne visuel (photo principale OU panorama) -->
            <div class="lg:col-span-2">
              @if (mainPhotoUrl()) {
                <!-- CAS A : photo principale + bouton visite 3D si dispo -->
                <div class="relative rounded-2xl overflow-hidden aspect-video bg-stone-200 dark:bg-stone-800 group cursor-pointer"
                     (click)="openLightbox(0)">
                  <img [src]="mainPhotoUrl()!" [alt]="p.titre"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <!-- Overlay hover -->
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                      <lucide-icon [img]="icons.Maximize2" class="w-4 h-4 text-stone-900 dark:text-white"></lucide-icon>
                      <span class="text-sm font-semibold text-stone-900 dark:text-white">Agrandir</span>
                    </div>
                  </div>

                  <!-- Bouton visite 3D flottant -->
                  @if (hasTour()) {
                    <button (click)="scrollToTour(); $event.stopPropagation()"
                            class="absolute bottom-4 left-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm hover:bg-white dark:hover:bg-stone-900 text-stone-900 dark:text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold transition-all hover:scale-105">
                      <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <lucide-icon [img]="icons.Play" class="w-3.5 h-3.5 text-white fill-white"></lucide-icon>
                      </div>
                      Visite 3D
                    </button>
                  }

                  <!-- Indicateur nombre de photos -->
                  @if (photos().length > 1) {
                    <div class="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
                      <lucide-icon [img]="icons.Camera" class="w-3.5 h-3.5"></lucide-icon>
                      {{ photos().length }} photos
                    </div>
                  }
                </div>
              } @else if (hasTour()) {
                <!-- CAS B : pas de photo, mais panorama dispo → panorama en avant -->
                <div id="tour-section" class="relative rounded-2xl overflow-hidden aspect-video bg-black">
                  <app-panorama-viewer
                    [scenes]="scenes().length > 0 ? scenes() : [legacyScene()]"
                    [hotspotsByScene]="scenes().length > 0 ? hotspotsByScene() : {}"
                    [backendBaseUrl]="'http://localhost:8087'" />
                  <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <lucide-icon [img]="icons.Compass" class="w-3.5 h-3.5"></lucide-icon>
                    Visite virtuelle 360°
                  </div>
                </div>
              } @else {
                <!-- CAS C : rien du tout → placeholder -->
                <div class="rounded-2xl overflow-hidden aspect-video bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center">
                  <lucide-icon [img]="icons.ImageIcon" class="w-16 h-16 text-stone-300 dark:text-stone-600 mb-3"></lucide-icon>
                  <p class="text-stone-500 dark:text-stone-400 text-sm font-medium">Aucune photo disponible</p>
                  <p class="text-stone-400 dark:text-stone-500 text-xs mt-1">Le propriétaire n'a pas encore ajouté de photos</p>
                </div>
              }
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <div class="vio-card sticky top-20">
                <p class="text-3xl font-black text-red-600 mb-1">{{ p.prix.toLocaleString('fr-FR') }} FCFA</p>
                <p class="text-sm text-stone-500 dark:text-stone-400 mb-4">
                  {{ p.type }} · {{ p.nombrePieces ?? '?' }} pièces · {{ p.surface ?? '?' }} m²
                </p>

                <hr class="my-4 border-stone-200 dark:border-stone-800" />

                <h3 class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">Propriétaire</h3>
                <p class="font-bold text-stone-900 dark:text-white">{{ p.owner.prenom }} {{ p.owner.nom }}</p>
                <p class="text-sm text-stone-500 dark:text-stone-400">{{ p.owner.whatsapp }}</p>

                <hr class="my-4 border-stone-200 dark:border-stone-800" />

                <a [href]="'https://wa.me/' + p.owner.whatsapp.replace('+', '')" target="_blank" class="btn-primary w-full">
                  💬 Contacter via WhatsApp
                </a>

                <button (click)="toggleFavorite()" class="btn-secondary w-full mt-3">
                  <lucide-icon [img]="icons.Heart" class="w-4 h-4"
                               [style.fill]="isFavorite() ? '#dc2626' : 'none'"
                               [style.color]="isFavorite() ? '#dc2626' : 'currentColor'"></lucide-icon>
                  {{ isFavorite() ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
                </button>

                @if (hasTour()) {
                  <button (click)="scrollToTour()" class="btn-secondary w-full mt-3">
                    <lucide-icon [img]="icons.Compass" class="w-4 h-4"></lucide-icon>
                    Voir la visite 3D
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="vio-card mb-6">
            <h2 class="text-xl font-bold text-stone-900 dark:text-white mb-3">{{ p.titre }}</h2>
            <p class="text-stone-700 dark:text-stone-300 leading-relaxed mb-4">{{ p.description }}</p>
            <div class="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <lucide-icon [img]="icons.MapPin" class="w-4 h-4"></lucide-icon>
              {{ p.commune }}, {{ p.ville }}
            </div>
          </div>

          <!-- Galerie photos -->
          @if (photos().length > 1) {
            <div class="vio-card mb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-stone-900 dark:text-white">
                  Photos ({{ photos().length }})
                </h2>
                <span class="text-xs text-stone-500 dark:text-stone-400">Cliquez pour agrandir</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                @for (photo of photos(); track photo.id; let idx = $index) {
                  <div class="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-stone-100 dark:bg-stone-800"
                       (click)="openLightbox(idx)">
                    <img [src]="'http://localhost:8087' + photo.url" [alt]="p.titre"
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <lucide-icon [img]="icons.Maximize2" class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Section visite 3D (si photos ET panorama → en bas) -->
          @if (hasTour() && photos().length > 0) {
            <div class="vio-card mb-6" id="tour-section">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <lucide-icon [img]="icons.Compass" class="w-5 h-5 text-blue-600 dark:text-blue-400"></lucide-icon>
                  Visite virtuelle 360°
                </h2>
                <span class="text-xs text-stone-500 dark:text-stone-400">Faites glisser pour explorer</span>
              </div>
              <div class="relative rounded-xl overflow-hidden aspect-video bg-black">
                <app-panorama-viewer
                  [scenes]="scenes().length > 0 ? scenes() : [legacyScene()]"
                  [hotspotsByScene]="scenes().length > 0 ? hotspotsByScene() : {}"
                  [backendBaseUrl]="'http://localhost:8087'" />
              </div>
            </div>
          }

          <!-- Gestion scènes (owner) -->
          @if (isOwner()) {
            <div class="mb-6">
              <app-scene-manager
                [propertyId]="p.id"
                (scenesChanged)="onScenesChanged($event)" />
            </div>

            <div class="vio-card">
              <button (click)="showUpload.set(!showUpload())" class="btn-secondary">
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
      }
    </div>

    <!-- Lightbox -->
    <app-image-lightbox
      [imageList]="lightboxImages()"
      [openIndex]="lightboxIndex()" />
  `
})
export class PropertyDetailComponent implements OnInit {

  property = signal<Property | null>(null);
  mediaList = signal<Media[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showUpload = signal(false);

  panoramaMedia = signal<Media | null>(null);
  photos = signal<Media[]>([]);
  mainPhotoUrl = signal<string | null>(null);

  scenes = signal<Scene[]>([]);
  hotspotsByScene = signal<{ [sceneId: number]: Hotspot[] }>({});

  isFavorite = signal(false);

  lightboxIndex = signal<number | null>(null);

  icons = { Compass, Heart, ArrowLeft, ChevronLeft, ChevronRight, Maximize2, ImageIcon, X, Play, Camera, MapPin };

  private route = inject(ActivatedRoute);
  private propertyService = inject(PropertyService);
  private mediaService = inject(MediaService);
  private sceneService = inject(SceneService);
  private favoriteService = inject(FavoriteService);
  public authService = inject(AuthService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    window.scrollTo(0, 0);

    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Track la vue (1 fois par session)
    const viewKey = `vio_viewed_${id}`;
    if (!sessionStorage.getItem(viewKey)) {
      this.http.post(`http://localhost:8087/api/properties/${id}/public/view`, {}).subscribe({
        next: () => sessionStorage.setItem(viewKey, '1'),
        error: (err) => console.error('track view error', err)
      });
    }

    this.propertyService.getPublicProperty(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.loading.set(false);
        this.loadScenes(id);

        if (this.authService.isAuthenticated()) {
          this.favoriteService.status(id).subscribe({
            next: (res) => this.isFavorite.set(res.isFavorite),
            error: () => {}
          });
        }

        this.mediaService.getMedia(id).subscribe({
          next: (media) => {
            this.mediaList.set(media);
            const photoList = media.filter(m => m.type === 'PHOTO');
            this.photos.set(photoList);
            this.panoramaMedia.set(media.find(m => m.type === 'PANORAMA_360') || null);

            // Photo principale : première photo
            if (photoList.length > 0) {
              this.mainPhotoUrl.set('http://localhost:8087' + photoList[0].url);
            }
          },
          error: (err) => console.error('Erreur médias', err)
        });
      },
      error: (err) => {
        this.error.set('Annonce introuvable');
        this.loading.set(false);
        console.error(err);
      }
    });

  }

  hasTour(): boolean {
    return this.scenes().length > 0 || this.panoramaMedia() !== null;
  }

  lightboxImages(): string[] {
    return this.photos().map(p => 'http://localhost:8087' + p.url);
  }

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
  }

  scrollToTour(): void {
    document.getElementById('tour-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private loadScenes(propertyId: number): void {
    this.sceneService.getScenesPublic(propertyId).subscribe({
      next: (scenes) => {
        if (scenes.length > 0) {
          this.applyScenes(scenes);
        } else if (this.isOwner()) {
          this.sceneService.getScenes(propertyId).subscribe({
            next: (ownerScenes) => this.applyScenes(ownerScenes),
            error: () => {}
          });
        } else {
          this.scenes.set([]);
        }
      },
      error: () => {
        if (this.isOwner()) {
          this.sceneService.getScenes(propertyId).subscribe({
            next: (ownerScenes) => this.applyScenes(ownerScenes),
            error: () => {}
          });
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
      this.photos.update(list => [...list, media]);
      if (!this.mainPhotoUrl()) {
        this.mainPhotoUrl.set('http://localhost:8087' + media.url);
      }
    }
  }

  toggleFavorite(): void {
    const p = this.property();
    if (!p) return;
    if (!this.authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    if (this.isFavorite()) {
      this.favoriteService.remove(p.id).subscribe({
        next: () => this.isFavorite.set(false),
        error: (err) => console.error(err)
      });
    } else {
      this.favoriteService.add(p.id).subscribe({
        next: () => this.isFavorite.set(true),
        error: (err) => console.error(err)
      });
    }
  }
}