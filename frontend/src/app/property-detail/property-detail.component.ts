import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { Media, MediaService } from '../services/media.service';
import { AuthService } from '../services/auth.service';
import { MediaUploadComponent } from '../media-upload/media-upload.component';
import { PanoramaViewerComponent } from '../panorama-viewer/panorama-viewer.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUploadComponent, PanoramaViewerComponent],
  template: `
    <!-- Panorama plein écran (si dispo) -->
    @if (panoramaMedia()) {
      <div class="relative w-full h-screen bg-black">
        <app-panorama-viewer
          [imageUrl]="'http://localhost:8087' + panoramaMedia()!.url"
          [title]="property()?.titre || ''" />

        <!-- Bouton retour flottant -->
        <a routerLink="/" class="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-md backdrop-blur-sm transition">
          ← Retour
        </a>

        <!-- Titre en bas (discret) -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
          <h1 class="text-3xl md:text-5xl font-bold text-white">{{ property()?.titre }}</h1>
          <p class="text-xl text-white/80">{{ property()?.commune }}, {{ property()?.ville }}</p>
          <p class="text-2xl font-bold text-red-400 mt-2">{{ property()?.prix }} FCFA</p>
        </div>
      </div>
    }

    <!-- Contenu (scrollable sous le panorama) -->
    <div class="min-h-screen bg-gray-50">
      @if (loading()) {
        <div class="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Chargement…</div>
      } @else if (error()) {
        <div class="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">{{ error() }}</div>
      } @else if (property()) {
        @let p = property()!;

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Si pas de panorama, afficher le titre ici -->
          @if (!panoramaMedia()) {
            <div class="mb-8">
              <h1 class="text-4xl font-bold text-gray-900">{{ p.titre }}</h1>
              <p class="text-lg text-gray-600">{{ p.commune }}, {{ p.ville }}</p>
            </div>
          }

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">
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

              <!-- Upload -->
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

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private mediaService: MediaService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getPublicProperty(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.loading.set(false);
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

  isOwner(): boolean {
    const p = this.property();
    if (!p || !this.authService.isAuthenticated()) return false;
    return p.owner.whatsapp === this.authService.getWhatsapp();
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