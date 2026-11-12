import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Favorite, FavoriteService } from '../services/favorite.service';

@Component({
  selector: 'app-client-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 class="text-2xl font-bold text-gray-900">Mes favoris</h1>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading()) {
          <p class="text-center text-gray-500 py-12">Chargement…</p>
        } @else if (error()) {
          <p class="text-center text-red-600 py-12">{{ error() }}</p>
        } @else if (favorites().length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500 mb-4">Vous n'avez pas encore de favoris.</p>
            <a routerLink="/" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition inline-block">
              Explorer les annonces
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (fav of favorites(); track fav.id) {
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div class="p-5 flex-1">
                  <h2 class="text-lg font-bold text-gray-900 mb-2">{{ fav.propertyTitre }}</h2>
                  <p class="text-sm font-semibold text-gray-600 mb-2">{{ fav.propertyCommune }}, {{ fav.propertyVille }}</p>
                  <p class="text-xs text-gray-500 mb-3">{{ fav.propertyType }}</p>
                  <p class="text-xl font-bold text-red-600 mb-3">{{ fav.propertyPrix }} FCFA</p>
                  <a [routerLink]="['/properties', fav.propertyId]"
                     class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Voir l'annonce →
                  </a>
                </div>
                <div class="border-t border-gray-200 p-3">
                  <button (click)="remove(fav.propertyId)"
                          class="w-full text-sm bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 rounded-md transition">
                    Retirer des favoris
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class ClientFavoritesComponent implements OnInit {

  favorites = signal<Favorite[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private favoriteService: FavoriteService) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.favoriteService.list().subscribe({
      next: (data) => {
        this.favorites.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des favoris');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  remove(propertyId: number): void {
    this.favoriteService.remove(propertyId).subscribe({
      next: () => {
        this.favorites.update(list => list.filter(f => f.propertyId !== propertyId));
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression');
      }
    });
  }
}