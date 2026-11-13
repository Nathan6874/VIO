import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, MapPin, Home as HomeIcon, Sparkles } from 'lucide-angular';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950">

      <!-- Hero -->
      <section class="relative overflow-hidden bg-gradient-to-br from-stone-50 via-white to-blue-50/60 dark:from-stone-950 dark:via-stone-900 dark:to-blue-950/30 border-b border-stone-200 dark:border-stone-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-6 border border-blue-200 dark:border-blue-900">
              <lucide-icon [img]="icons.Sparkles" class="w-3.5 h-3.5"></lucide-icon>
              Visitez avant de choisir
            </div>
            <h1 class="text-4xl md:text-6xl font-black tracking-tight text-stone-900 dark:text-white mb-6 leading-tight">
              Trouvez votre prochain chez-vous,<br>
              <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">sans vous déplacer.</span>
            </h1>
            <p class="text-lg text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Explorez des logements à Abidjan en visite 3D immersive, comparez, choisissez. Contactez directement le propriétaire.
            </p>
          </div>

          <!-- Barre de recherche ÉVIDENTE -->
          <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl shadow-blue-900/10 dark:shadow-black/50 border-2 border-stone-200 dark:border-stone-700 p-3 mt-10 max-w-4xl">
            <div class="flex flex-col md:flex-row gap-2">
              <div class="flex-1 relative">
                <lucide-icon [img]="icons.Search" class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input type="text"
                      [ngModel]="filterVille()"
                      (ngModelChange)="filterVille.set($event)"
                      placeholder="Ville ou commune (ex: Cocody)"
                      class="w-full pl-12 pr-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium transition-all" />
              </div>
              <div class="w-px bg-stone-200 dark:bg-stone-700 hidden md:block"></div>
              <select [ngModel]="filterType()"
                      (ngModelChange)="filterType.set($event)"
                      class="px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium cursor-pointer transition-all">
                <option value="">Tous types</option>
                <option value="APPARTEMENT">Appartement</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
                <option value="TERRAIN">Terrain</option>
                <option value="BUREAU">Bureau</option>
              </select>
              <div class="w-px bg-stone-200 dark:bg-stone-700 hidden md:block"></div>
              <input type="number"
                    [ngModel]="filterPrixMax()"
                    (ngModelChange)="filterPrixMax.set($event ? +$event : null)"
                    placeholder="Prix max (FCFA)"
                    class="px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-medium w-full md:w-44 transition-all" />
              <button (click)="resetFilters()"
                      class="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 dark:text-stone-900 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm whitespace-nowrap">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Résultats -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-section-title">
            @if (filteredProperties().length === 0) {
              Aucune annonce
            } @else {
              {{ filteredProperties().length }} annonce{{ filteredProperties().length > 1 ? 's' : '' }}
            }
          </h2>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="vio-card animate-pulse">
                <div class="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-3"></div>
                <div class="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2 mb-4"></div>
                <div class="h-8 bg-stone-200 dark:bg-stone-700 rounded w-1/3"></div>
              </div>
            }
          </div>
        } @else if (error()) {
          <div class="text-center py-12">
            <p class="text-red-600 dark:text-red-400">{{ error() }}</p>
          </div>
        } @else if (filteredProperties().length === 0) {
          <div class="text-center py-20">
            <lucide-icon [img]="icons.HomeIcon" class="w-16 h-16 mx-auto text-stone-300 dark:text-stone-700 mb-4"></lucide-icon>
            <p class="text-stone-500 dark:text-stone-400 text-lg">Aucune annonce ne correspond à vos critères.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (p of filteredProperties(); track p.id) {
              <a [routerLink]="['/properties', p.id]"
                 class="group vio-card hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all cursor-pointer block">
                <div class="flex items-start justify-between mb-4">
                  <span class="badge-info">{{ p.type }}</span>
                  <span class="text-xs text-stone-500 dark:text-stone-400">
                    {{ p.nombrePieces ?? '?' }} p. · {{ p.surface ?? '?' }} m²
                  </span>
                </div>

                <h3 class="text-lg font-bold text-stone-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ p.titre }}
                </h3>

                <div class="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 mb-4">
                  <lucide-icon [img]="icons.MapPin" class="w-3.5 h-3.5"></lucide-icon>
                  {{ p.commune }}, {{ p.ville }}
                </div>

                <p class="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
                  {{ p.description }}
                </p>

                <div class="flex items-end justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                  <div>
                    <p class="text-2xl font-black text-stone-900 dark:text-white">
                      {{ p.prix.toLocaleString('fr-FR') }}
                      <span class="text-sm font-medium text-stone-500">FCFA</span>
                    </p>
                  </div>
                  <span class="text-xs text-stone-400 dark:text-stone-500">
                    {{ p.owner.prenom }} {{ p.owner.nom }}
                  </span>
                </div>
              </a>
            }
          </div>
        }
      </section>

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

  icons = { Search, MapPin, HomeIcon, Sparkles };

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
        this.error.set('Erreur lors du chargement');
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