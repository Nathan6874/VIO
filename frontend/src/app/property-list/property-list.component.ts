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
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Annonces VIO</h1>
          <nav class="flex items-center gap-4">
            @if (authService.isAuthenticated()) {
              @if (authService.getRole() === 'ADMIN') {
                <a routerLink="/admin/dashboard" class="text-sm font-medium text-blue-600 hover:text-blue-800">Admin</a>
              }
              @if (authService.getRole() === 'CLIENT') {
                <a routerLink="/client/favorites" class="text-sm font-medium text-pink-600 hover:text-pink-800">❤️ Mes favoris</a>
              }
              @if (authService.getRole() === 'OWNER') {
                <a routerLink="/owner/dashboard" class="text-sm font-medium text-blue-600 hover:text-blue-800">Mes annonces</a>
              }
              <button (click)="authService.logout()" class="text-sm font-medium text-gray-600 hover:text-gray-900">Déconnexion</button>
            } @else {
              <a routerLink="/register" class="text-sm font-medium text-gray-600 hover:text-gray-900">Inscription</a>
              <a routerLink="/login" class="text-sm font-medium text-blue-600 hover:text-blue-800">Connexion</a>
            }
          </nav>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4 items-end">
          <div class="flex flex-col">
            <label class="text-xs font-semibold text-gray-600 mb-1">Type</label>
            <select
              [ngModel]="filterType()"
              (ngModelChange)="filterType.set($event)"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous</option>
              <option value="APPARTEMENT">Appartement</option>
              <option value="VILLA">Villa</option>
              <option value="STUDIO">Studio</option>
              <option value="TERRAIN">Terrain</option>
              <option value="BUREAU">Bureau</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-semibold text-gray-600 mb-1">Ville / Commune</label>
            <input
              type="text"
              [ngModel]="filterVille()"
              (ngModelChange)="filterVille.set($event)"
              placeholder="Ex: Abidjan"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-semibold text-gray-600 mb-1">Prix max (FCFA)</label>
            <input
              type="number"
              [ngModel]="filterPrixMax()"
              (ngModelChange)="filterPrixMax.set($event ? +$event : null)"
              placeholder="Ex: 200000"
              min="0"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button
            (click)="resetFilters()"
            class="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-md transition">
            Réinitialiser
          </button>
        </div>
      </div>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        @if (loading()) {
          <p class="text-center text-gray-500 py-12">Chargement…</p>
        } @else if (error()) {
          <p class="text-center text-red-600 py-12">{{ error() }}</p>
        } @else if (filteredProperties().length === 0) {
          <p class="text-center text-gray-500 py-12">Aucune annonce ne correspond à vos critères.</p>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (p of filteredProperties(); track p.id) {
              <a [routerLink]="['/properties', p.id]"
                 class="block bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden">
                <div class="p-5">
                  <h2 class="text-lg font-bold text-gray-900 mb-2">{{ p.titre }}</h2>
                  <p class="text-sm font-semibold text-gray-600 mb-2">{{ p.commune }}, {{ p.ville }}</p>
                  <p class="text-xs text-gray-500 mb-3">
                    {{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²
                  </p>
                  <p class="text-xl font-bold text-red-600 mb-3">{{ p.prix }} FCFA</p>
                  <p class="text-sm text-gray-700 mb-3 line-clamp-2">{{ p.description }}</p>
                  <p class="text-xs text-gray-500 italic">Propriétaire : {{ p.owner.prenom }} {{ p.owner.nom }}</p>
                </div>
              </a>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class PropertyListComponent implements OnInit {

  properties = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  filterType = signal('');
  filterVille = signal('');
  filterPrixMax = signal<number | null>(null);

  filteredProperties = computed(() => {
    let list = this.properties();
    const type = this.filterType();
    const ville = this.filterVille();
    const prixMax = this.filterPrixMax();

    if (type) list = list.filter(p => p.type === type);
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