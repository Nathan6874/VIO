import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { Media, MediaService } from '../services/media.service';
import { PanoramaViewerComponent } from '../panorama-viewer/panorama-viewer.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PanoramaViewerComponent],
  template: `
    <a routerLink="/" class="back">← Retour</a>

    @if (loading()) {
      <p>Chargement…</p>
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

        @if (mediaList().length > 0) {
          <h2>Photos</h2>
          <div class="gallery">
            @for (m of mediaList(); track m.id) {
              <div class="gallery-item">
                @if (m.type === 'PHOTO') {
                  <img [src]="'http://localhost:8087' + m.url" alt="Photo du bien" />
                } @else if (m.type === 'PANORAMA_360') {
                  <div class="panorama-placeholder">
                      <app-panorama-viewer [imageUrl]="'http://localhost:8087' + m.url" [title]="property()!.titre" />
                  </div>
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
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .gallery-item img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
    .panorama-placeholder { width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 8px; color: #666; }
    .error { color: red; padding: 1rem 2rem; }
  `]
})
export class PropertyDetailComponent implements OnInit {

  property = signal<Property | null>(null);
  mediaList = signal<Media[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private mediaService: MediaService
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getPublicProperty(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.loading.set(false);
        // Charger les médias
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
}