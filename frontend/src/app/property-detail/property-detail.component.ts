import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
      </div>
    }
  `,
  styles: [`
    .back { display: inline-block; padding: 1rem 2rem; color: #007bff; text-decoration: none; }
    .back:hover { text-decoration: underline; }
    .detail { padding: 1rem 2rem; max-width: 800px; }
    .detail h1 { margin: 0 0 0.5rem 0; }
    .location { color: #666; font-weight: bold; }
    .type { color: #888; }
    .price { font-size: 1.8rem; color: #e74c3c; font-weight: bold; }
    .description { color: #444; margin: 1rem 0; }
    .owner { color: #555; font-style: italic; }
    .error { color: red; padding: 1rem 2rem; }
  `]
})
export class PropertyDetailComponent implements OnInit {

  property = signal<Property | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getPublicProperty(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Annonce introuvable ou erreur serveur');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}