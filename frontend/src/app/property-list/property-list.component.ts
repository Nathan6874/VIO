import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Annonces VIO</h1>

    @if (loading()) {
      <p>Chargement…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (properties().length === 0) {
      <p>Aucune annonce approuvée pour le moment.</p>
    } @else {
      <div class="grid">
        @for (p of properties(); track p.id) {
          <div class="card">
            <h2>{{ p.titre }}</h2>
            <p class="location">{{ p.commune }}, {{ p.ville }}</p>
            <p class="type">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
            <p class="price">{{ p.prix }} FCFA</p>
            <p class="description">{{ p.description }}</p>
            <p class="owner">Propriétaire : {{ p.owner.prenom }} {{ p.owner.nom }}</p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    h1 { padding: 1rem 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1rem 2rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    .card h2 { margin: 0 0 0.5rem 0; font-size: 1.2rem; }
    .location { color: #666; font-weight: bold; }
    .type { color: #888; font-size: 0.9rem; }
    .price { font-size: 1.3rem; color: #e74c3c; font-weight: bold; }
    .description { color: #444; }
    .owner { font-size: 0.85rem; color: #555; font-style: italic; }
    .error { color: red; padding: 1rem 2rem; }
  `]
})
export class PropertyListComponent implements OnInit {

  properties = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private propertyService: PropertyService) {
  }

  ngOnInit(): void {
    this.propertyService.getPublicProperties().subscribe({
      next: (data) => {
        this.properties.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des annonces');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}