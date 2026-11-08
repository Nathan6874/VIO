import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header">
      <h1>Mes annonces</h1>
      <a routerLink="/owner/properties/new" class="btn-primary">+ Nouvelle annonce</a>
    </div>

    @if (loading()) {
      <p>Chargement…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (properties().length === 0) {
      <p class="empty">Aucune annonce pour le moment. Créez-en une !</p>
    } @else {
      <div class="grid">
        @for (p of properties(); track p.id) {
          <div class="card">
            <div class="card-header">
              <h2>{{ p.titre }}</h2>
              <span class="status" [class.approved]="p.status === 'APPROVED'" [class.pending]="p.status === 'PENDING'" [class.rejected]="p.status === 'REJECTED'">
                {{ p.status }}
              </span>
            </div>
            <p class="location">{{ p.commune }}, {{ p.ville }}</p>
            <p class="type">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
            <p class="price">{{ p.prix }} FCFA</p>
            <p class="description">{{ p.description }}</p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; }
    .header h1 { margin: 0; }
    .btn-primary { padding: 0.6rem 1.2rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .btn-primary:hover { background: #0056b3; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1rem 2rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .card-header h2 { margin: 0; font-size: 1.1rem; }
    .status { font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; }
    .status.pending { background: #fff3cd; color: #856404; }
    .status.approved { background: #d4edda; color: #155724; }
    .status.rejected { background: #f8d7da; color: #721c24; }
    .location { color: #666; font-weight: bold; margin: 0.3rem 0; }
    .type { color: #888; font-size: 0.9rem; margin: 0.3rem 0; }
    .price { font-size: 1.2rem; color: #e74c3c; font-weight: bold; margin: 0.5rem 0; }
    .description { color: #444; font-size: 0.9rem; }
    .empty { padding: 2rem; color: #666; }
    .error { color: red; padding: 1rem 2rem; }
  `]
})
export class OwnerDashboardComponent implements OnInit {

  properties = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private propertyService: PropertyService) {
  }

  ngOnInit(): void {
    this.propertyService.getMyProperties().subscribe({
      next: (data) => {
        this.properties.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de vos annonces');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}