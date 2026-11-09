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
    <a routerLink="/" class="back">← Retour</a>

    @if (loading()) {
      <p class="loading">Chargement…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (property()) {
      @let p = property()!;
      <div class="detail">
        <h1>{{ p.titre }}</h1>
        <p class="location">{{ p.commune }}, {{ p.ville }}</p>
        <p class="type">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
        <p class="price">{{ p.prix }} FCFA</p>
        <p class="description">{{ p.description }}</p>
        <p class="owner">Propriétaire : {{ p.owner.prenom }} {{ p.owner.nom }}</p>

        @if (isOwner()) {
          <button (click)="showUpload.set(!showUpload())" class="btn-upload">
            {{ showUpload() ? "Masquer l'upload" : '+ Ajouter un média' }}
          </button>
        }

        @if (showUpload() && isOwner()) {
          <app-media-upload [propertyId]="p.id" (mediaUploaded)="onMediaUploaded($event)" />
        }

        @if (mediaList().length > 0) {
          <h2>Photos et visites</h2>
          <div class="gallery">
            @for (m of mediaList(); track m.id) {
              <div class="gallery-item">
                @if (m.type === 'PHOTO') {
                  <img [src]="'http://localhost:8087' + m.url" alt="Photo du bien" />
                } @else if (m.type === 'PANORAMA_360') {
                  <app-panorama-viewer [imageUrl]="'http://localhost:8087' + m.url" [title]="p.titre" />
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .back { display: inline-block; padding: 1rem 2rem; color: #007bff; text-decoration: none; }
    .back:hover { text-decoration: underline; }
    .detail { padding: 1rem 2rem; max-width: 900px; }
    .detail h1 { margin: 0 0 0.5rem 0; }
    .detail h2 { margin-top: 2rem; }
    .location { color: #666; font-weight: bold; }
    .type { color: #888; }
    .price { font-size: 1.8rem; color: #e74c3c; font-weight: bold; }
    .description { color: #444; margin: 1rem 0; }
    .owner { color: #555; font-style: italic; }
    .btn-upload { margin: 1rem 0; padding: 0.7rem 1.2rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .btn-upload:hover { background: #218838; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .gallery-item img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
    .loading, .empty { padding: 2rem; color: #666; }
    .error { color: red; padding: 1rem 2rem; }
  `]
})
export class PropertyDetailComponent implements OnInit {

  property = signal<Property | null>(null);
  mediaList = signal<Media[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showUpload = signal(false);

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
          next: (media) => this.mediaList.set(media),
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
    const userWhatsapp = this.authService.getWhatsapp();
    return p.owner.whatsapp === userWhatsapp;
  }

  onMediaUploaded(media: Media): void {
    this.mediaList.update(list => [...list, media]);
  }
}