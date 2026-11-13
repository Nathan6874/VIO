import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, Building2 } from 'lucide-angular';
import { PropertyService } from '../services/property.service';
import { CreatePropertyRequest } from '../models/property.model';
import { MediaUploadComponent } from '../media-upload/media-upload.component';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, MediaUploadComponent],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div class="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">

        <!-- En-tête -->
        <div class="mb-6 sm:mb-8">
          <a routerLink="/owner/dashboard" class="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white mb-3 font-medium">
            <lucide-icon [img]="icons.ArrowLeft" class="w-4 h-4"></lucide-icon>
            Retour à mes annonces
          </a>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">Nouvelle annonce</h1>
          <p class="text-sm sm:text-base text-stone-500 dark:text-stone-400 mt-1">Remplissez les informations du bien</p>
        </div>

        <!-- Formulaire -->
        <div class="vio-card">
          <form (ngSubmit)="onSubmit()" class="space-y-5">

            <div>
              <label class="label">Titre de l'annonce *</label>
              <input type="text" [(ngModel)]="form.titre" name="titre" required
                     placeholder="Ex: Appartement 3 pièces à Cocody"
                     class="input" />
            </div>

            <div>
              <label class="label">Description *</label>
              <textarea [(ngModel)]="form.description" name="description" rows="4" required
                        placeholder="Décrivez votre bien : équipements, quartier, transport..."
                        class="input resize-none"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label">Ville *</label>
                <input type="text" [(ngModel)]="form.ville" name="ville" required
                       placeholder="Abidjan" class="input" />
              </div>
              <div>
                <label class="label">Commune *</label>
                <input type="text" [(ngModel)]="form.commune" name="commune" required
                       placeholder="Cocody" class="input" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label">Prix (FCFA) *</label>
                <input type="number" [(ngModel)]="form.prix" name="prix" required min="0"
                       placeholder="250000" class="input" />
              </div>
              <div>
                <label class="label">Type de bien *</label>
                <select [(ngModel)]="form.type" name="type" required class="input">
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
                <label class="label">Nombre de pièces</label>
                <input type="number" [(ngModel)]="form.nombrePieces" name="nombrePieces" min="0"
                       placeholder="3" class="input" />
              </div>
              <div>
                <label class="label">Surface (m²)</label>
                <input type="number" [(ngModel)]="form.surface" name="surface" min="0" step="0.1"
                       placeholder="75" class="input" />
              </div>
            </div>

            @if (error()) {
              <div class="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p class="text-sm text-red-700 dark:text-red-400 font-medium mb-3">{{ error() }}</p>
                @if (error()?.includes('Limite')) {
                  <a routerLink="/owner/subscription" class="btn-primary inline-flex">
                    Voir les abonnements →
                  </a>
                }
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn-primary w-full">
              <lucide-icon [img]="icons.Save" class="w-4 h-4"></lucide-icon>
              {{ loading() ? 'Création…' : "Créer l'annonce" }}
            </button>
          </form>
        </div>

        <!-- Upload médias après création -->
        @if (createdPropertyId()) {
          <div class="vio-card mt-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <lucide-icon [img]="icons.Building2" class="w-5 h-5 text-emerald-600 dark:text-emerald-400"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold text-stone-900 dark:text-white">Annonce créée !</h3>
                <p class="text-sm text-stone-500 dark:text-stone-400">Ajoutez maintenant des photos et panoramas 360°</p>
              </div>
            </div>
            <app-media-upload [propertyId]="createdPropertyId()!" />
            <a routerLink="/owner/dashboard" class="btn-primary w-full mt-4">
              Terminer → Mes annonces
            </a>
          </div>
        }

      </div>
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

  icons = { ArrowLeft, Save, Building2 };

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.form.titre.trim() || !this.form.description.trim()
        || !this.form.ville.trim() || !this.form.commune.trim()
        || this.form.prix <= 0) {
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
        if (err.status === 403 && err.error?.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set("Erreur lors de la création");
        }
        console.error(err);
      }
    });
  }
}