import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="header">
      <h1>Annonces VIO</h1>
      @if (authService.isAuthenticated()) {
        <div class="actions">
          @if (authService.getRole() === 'ADMIN') {
            <a routerLink="/admin/dashboard" class="btn-link">Admin</a>
          }
          <a routerLink="/owner/dashboard" class="btn-link">Mes annonces</a>
          <button (click)="authService.logout()">Déconnexion</button>
        </div>
      } @else {
        <a routerLink="/login" class="login-link">Connexion</a>
      }
    </div>

    <!-- Filtres -->
    <div class="filters">
      <label>
        Type
        <select
          [ngModel]="filterType()"
          (ngModelChange)="filterType.set($event)">
          <option value="">Tous</option>
          <option value="APPARTEMENT">Appartement</option>
          <option value="VILLA">Villa</option>
          <option value="STUDIO">Studio</option>
          <option value="TERRAIN">Terrain</option>
          <option value="BUREAU">Bureau</option>
          <option value="AUTRE">Autre</option>
        </select>
      </label>

      <label>
        Ville / Commune
        <input
          type="text"
          [ngModel]="filterVille()"
          (ngModelChange)="filterVille.set($event)"
          placeholder="Ex: Abidjan" />
      </label>

      <label>
        Prix max (FCFA)
        <input
          type="number"
          [ngModel]="filterPrixMax()"
          (ngModelChange)="filterPrixMax.set($event ? +$event : null)"
          placeholder="Ex: 200000"
          min="0" />
      </label>

      <button (click)="resetFilters()" class="btn-reset">Réinitialiser</button>
    </div>

    @if (loading()) {
      <p class="loading">Chargement…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (filteredProperties().length === 0) {
      <p class="empty">Aucune annonce ne correspond à vos critères.</p>
    } @else {
      <div class="grid">
        @for (p of filteredProperties(); track p.id) {
          <a [routerLink]="['/properties', p.id]" class="card-link">
            <div class="card">
              <h2>{{ p.titre }}</h2>
              <p class="location">{{ p.commune }}, {{ p.ville }}</p>
              <p class="type">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
              <p class="price">{{ p.prix }} FCFA</p>
              <p class="description">{{ p.description }}</p>
              <p class="owner">Propriétaire : {{ p.owner.prenom }} {{ p.owner.nom }}</p>
            </div>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; }
    .header h1 { margin: 0; }
    .actions { display: flex; gap: 1rem; align-items: center; }
    .btn-link { color: #007bff; text-decoration: none; font-weight: bold; }
    .login-link { color: #007bff; text-decoration: none; font-weight: bold; }
    .filters { display: flex; flex-wrap: wrap; gap: 1rem; padding: 1rem 2rem; background: #f8f9fa; border-bottom: 1px solid #eee; align-items: flex-end; }
    .filters label { display: flex; flex-direction: column; font-size: 0.85rem; font-weight: bold; }
    .filters input, .filters select { padding: 0.4rem; margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; }
    .btn-reset { padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .btn-reset:hover { background: #5a6268; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1rem 2rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    .card h2 { margin: 0 0 0.5rem 0; font-size: 1.2rem; }
    .location { color: #666; font-weight: bold; }
    .type { color: #888; font-size: 0.9rem; }
    .price { font-size: 1.3rem; color: #e74c3c; font-weight: bold; }
    .description { color: #444; }
    .owner { font-size: 0.85rem; color: #555; font-style: italic; }
    .card-link { text-decoration: none; color: inherit; }
    .card-link:hover .card { border-color: #007bff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .loading, .empty { padding: 2rem; color: #666; }
    .error { color: red; padding: 1rem 2rem; }
  `]
})
export class PropertyListComponent implements OnInit {

  properties = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtres (signals)
  filterType = signal('');
  filterVille = signal('');
  filterPrixMax = signal<number | null>(null);

  // Liste filtrée (computed)
  filteredProperties = computed(() => {
    let list = this.properties();
    const type = this.filterType();
    const ville = this.filterVille();
    const prixMax = this.filterPrixMax();

    if (type) {
      list = list.filter(p => p.type === type);
    }
    if (ville) {
      const search = ville.toLowerCase();
      list = list.filter(p =>
        p.ville.toLowerCase().includes(search) ||
        p.commune.toLowerCase().includes(search)
      );
    }
    if (prixMax !== null && prixMax > 0) {
      list = list.filter(p => p.prix <= prixMax);
    }
    return list;
  });

  constructor(
    private propertyService: PropertyService,
    public authService: AuthService
  ) {}

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

  resetFilters(): void {
    this.filterType.set('');
    this.filterVille.set('');
    this.filterPrixMax.set(null);
  }
}