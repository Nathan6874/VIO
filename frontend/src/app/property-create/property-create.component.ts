import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../services/property.service';
import { CreatePropertyRequest } from '../models/property.model';
import { MediaUploadComponent } from '../media-upload/media-upload.component';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaUploadComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a routerLink="/owner/dashboard" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Retour à mes annonces
          </a>
          <h1 class="text-2xl font-bold text-gray-900 mt-2">Nouvelle annonce</h1>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" [(ngModel)]="form.titre" name="titre" required
                     class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea [(ngModel)]="form.description" name="description" rows="3" required
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input type="text" [(ngModel)]="form.ville" name="ville" required
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Commune *</label>
                <input type="text" [(ngModel)]="form.commune" name="commune" required
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
                <input type="number" [(ngModel)]="form.prix" name="prix" required min="0"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select [(ngModel)]="form.type" name="type" required
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio</option>
                  <option value="TERRAIN">Terrain</option>
                  <option value="BUREAU">Bureau</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de pièces</label>
                <input type="number" [(ngModel)]="form.nombrePieces" name="nombrePieces" min="0"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                <input type="number" [(ngModel)]="form.surface" name="surface" min="0" step="0.1"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            @if (error()) {
              <p class="text-red-600 text-sm">{{ error() }}</p>
            }

            <button type="submit" [disabled]="loading()"
                    class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition">
              {{ loading() ? 'Création…' : "Créer l'annonce" }}
            </button>
          </form>
        </div>

        @if (createdPropertyId()) {
          <div class="mt-6">
            <app-media-upload [propertyId]="createdPropertyId()!" />
            <a routerLink="/owner/dashboard"
               class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition mt-4">
              Terminer → Mes annonces
            </a>
          </div>
        }
      </main>
    </div>
  `
})
export class PropertyCreateComponent {

  form = {
    titre: '',
    description: '',
    ville: '',
    commune: '',
    prix: 0,
    type: 'APPARTEMENT',
    nombrePieces: null as number | null,
    surface: null as number | null
  };

  loading = signal(false);
  error = signal<string | null>(null);
  createdPropertyId = signal<number | null>(null);

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.form.titre.trim() || !this.form.description.trim() ||
        !this.form.ville.trim() || !this.form.commune.trim() ||
        this.form.prix <= 0) {
      this.error.set('Tous les champs obligatoires doivent être remplis');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const data: CreatePropertyRequest = {
      titre: this.form.titre,
      description: this.form.description,
      ville: this.form.ville,
      commune: this.form.commune,
      prix: Number(this.form.prix),
      type: this.form.type,
      nombrePieces: this.form.nombrePieces,
      surface: this.form.surface
    };

    this.propertyService.createProperty(data).subscribe({
      next: (property) => {
        this.loading.set(false);
        this.createdPropertyId.set(property.id);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set("Erreur lors de la création de l'annonce");
        console.error(err);
      }
    });
  }
}