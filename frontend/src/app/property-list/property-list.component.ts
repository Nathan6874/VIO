import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

    @if (loading()) {
      <p>Chargement…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (properties().length === 0) {
      <p>Aucune annonce approuvée pour le moment.</p>
    } @else {
      <div class="grid">
        @for (p of properties(); track p.id) {
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
    .login-link { color: #007bff; text-decoration: none; font-weight: bold; }
    .actions { display: flex; gap: 1rem; align-items: center; }
    .btn-link { color: #007bff; text-decoration: none; font-weight: bold; }
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
    .card-link { text-decoration: none; color: inherit; }
    .card-link:hover .card { border-color: #007bff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  `]
})
export class PropertyListComponent implements OnInit {

  properties = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private propertyService: PropertyService, public authService: AuthService) {
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