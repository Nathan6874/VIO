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
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Mes annonces</h1>
          <a routerLink="/owner/properties/new"
             class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition">
            + Nouvelle annonce
          </a>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading()) {
          <p class="text-center text-gray-500 py-12">Chargement…</p>
        } @else if (error()) {
          <p class="text-center text-red-600 py-12">{{ error() }}</p>
        } @else if (properties().length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500 mb-4">Aucune annonce pour le moment.</p>
            <a routerLink="/owner/properties/new"
               class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition">
              Créer ma première annonce
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (p of properties(); track p.id) {
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-5">
                  <div class="flex justify-between items-start mb-2">
                    <h2 class="text-lg font-bold text-gray-900">{{ p.titre }}</h2>
                    <span class="text-xs font-bold px-2 py-1 rounded"
                          [class.bg-green-100]="p.status === 'APPROVED'"
                          [class.text-green-800]="p.status === 'APPROVED'"
                          [class.bg-yellow-100]="p.status === 'PENDING'"
                          [class.text-yellow-800]="p.status === 'PENDING'"
                          [class.bg-red-100]="p.status === 'REJECTED'"
                          [class.text-red-800]="p.status === 'REJECTED'">
                      {{ p.status }}
                    </span>
                  </div>
                  <p class="text-sm font-semibold text-gray-600 mb-2">{{ p.commune }}, {{ p.ville }}</p>
                  <p class="text-xs text-gray-500 mb-3">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
                  <p class="text-xl font-bold text-red-600 mb-3">{{ p.prix }} FCFA</p>
                  <p class="text-sm text-gray-700 mb-3 line-clamp-2">{{ p.description }}</p>
                  <a [routerLink]="['/properties', p.id]"
                     class="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Voir l'annonce →
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class OwnerDashboardComponent implements OnInit {

  properties = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private propertyService: PropertyService) {}

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