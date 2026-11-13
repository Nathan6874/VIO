import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, MapPin, ArrowRight, Trash2 } from 'lucide-angular';
import { Favorite, FavoriteService } from '../services/favorite.service';

@Component({
  selector: 'app-client-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
            <lucide-icon [img]="icons.Heart" class="w-6 h-6 text-white fill-white"></lucide-icon>
          </div>
          <div>
            <h1 class="text-3xl font-black text-stone-900 dark:text-white">Mes favoris</h1>
            <p class="text-sm text-stone-500 dark:text-stone-400">
              {{ favorites().length }} annonce{{ favorites().length > 1 ? 's' : '' }} sauvegardée{{ favorites().length > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3]; track i) {
              <div class="vio-card animate-pulse">
                <div class="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-3"></div>
                <div class="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2 mb-4"></div>
                <div class="h-8 bg-stone-200 dark:bg-stone-700 rounded w-1/3"></div>
              </div>
            }
          </div>
        } @else if (error()) {
          <div class="vio-card text-center py-12">
            <p class="text-red-600 dark:text-red-400">{{ error() }}</p>
          </div>
        } @else if (favorites().length === 0) {
          <div class="vio-card text-center py-16">
            <div class="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon [img]="icons.Heart" class="w-10 h-10 text-stone-400 dark:text-stone-500"></lucide-icon>
            </div>
            <h2 class="text-xl font-bold text-stone-900 dark:text-white mb-2">Aucun favori</h2>
            <p class="text-stone-500 dark:text-stone-400 mb-6">
              Explorez les annonces et cliquez sur ❤️ pour les sauvegarder.
            </p>
            <a routerLink="/" class="btn-primary inline-flex">
              Explorer les annonces
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (fav of favorites(); track fav.id) {
              <div class="vio-card flex flex-col hover:shadow-lg transition-shadow">
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-3">
                    <span class="badge-info">{{ fav.propertyType }}</span>
                  </div>
                  <h3 class="text-lg font-bold text-stone-900 dark:text-white mb-2">{{ fav.propertyTitre }}</h3>
                  <div class="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 mb-4">
                    <lucide-icon [img]="icons.MapPin" class="w-3.5 h-3.5"></lucide-icon>
                    {{ fav.propertyCommune }}, {{ fav.propertyVille }}
                  </div>
                  <p class="text-2xl font-black text-red-600 dark:text-red-400 mb-4">
                    {{ fav.propertyPrix.toLocaleString('fr-FR') }}
                    <span class="text-sm font-medium text-stone-500">FCFA</span>
                  </p>
                </div>
                <div class="border-t border-stone-100 dark:border-stone-800 pt-4 flex gap-2">
                  <a [routerLink]="['/properties', fav.propertyId]"
                     class="flex-1 btn-secondary text-center">
                    Voir l'annonce
                    <lucide-icon [img]="icons.ArrowRight" class="w-4 h-4"></lucide-icon>
                  </a>
                  <button (click)="remove(fav.propertyId)"
                          class="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          title="Retirer des favoris">
                    <lucide-icon [img]="icons.Trash2" class="w-4 h-4"></lucide-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ClientFavoritesComponent implements OnInit {
  favorites = signal<Favorite[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  icons = { Heart, MapPin, ArrowRight, Trash2 };

  private favoriteService = inject(FavoriteService);

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
      }
    });
  }
}