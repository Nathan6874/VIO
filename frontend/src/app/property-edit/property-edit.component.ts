import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, X } from 'lucide-angular';
import { PropertyService } from '../services/property.service';
import { Property } from '../models/property.model';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950 py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <a routerLink="/owner/dashboard" class="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium mb-6">
          <lucide-icon [img]="icons.ArrowLeft" class="w-4 h-4"></lucide-icon>
          Retour au dashboard
        </a>

        <div class="vio-card">
          <h1 class="text-2xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
            <lucide-icon [img]="icons.Save" class="w-6 h-6 text-blue-600"></lucide-icon>
            Modifier l'annonce
          </h1>

          @if (loading()) {
            <p class="text-stone-500">Chargement…</p>
          } @else if (error()) {
            <p class="text-red-600">{{ error() }}</p>
          } @else if (property()) {
            <form (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Titre -->
              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Titre *</label>
                <input type="text" [(ngModel)]="form.titre" name="titre" required
                       class="input w-full" />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description *</label>
                <textarea [(ngModel)]="form.description" name="description" required rows="4"
                          class="input w-full"></textarea>
              </div>

              <!-- Ville + Commune -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Ville *</label>
                  <input type="text" [(ngModel)]="form.ville" name="ville" required class="input w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Commune *</label>
                  <input type="text" [(ngModel)]="form.commune" name="commune" required class="input w-full" />
                </div>
              </div>

              <!-- Prix + Type -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Prix (FCFA) *</label>
                  <input type="number" [(ngModel)]="form.prix" name="prix" required class="input w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Type *</label>
                  <select [(ngModel)]="form.type" name="type" required class="input w-full">
                    <option value="APPARTEMENT">Appartement</option>
                    <option value="VILLA">Villa</option>
                    <option value="STUDIO">Studio</option>
                    <option value="TERRAIN">Terrain</option>
                    <option value="BUREAU">Bureau</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>

              <!-- Pièces + Surface -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nombre de pièces</label>
                  <input type="number" [(ngModel)]="form.nombrePieces" name="nombrePieces" class="input w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Surface (m²)</label>
                  <input type="number" [(ngModel)]="form.surface" name="surface" class="input w-full" />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button type="submit" [disabled]="saving()" class="btn-primary flex-1">
                  <lucide-icon [img]="icons.Save" class="w-4 h-4"></lucide-icon>
                  {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
                </button>
                <a routerLink="/owner/dashboard" class="btn-secondary flex-1 text-center">
                  <lucide-icon [img]="icons.X" class="w-4 h-4 inline"></lucide-icon>
                  Annuler
                </a>
              </div>

              @if (success()) {
                <p class="text-green-600 dark:text-green-400 text-sm font-medium">✅ Annonce mise à jour ! Redirection…</p>
              }
            </form>
          }
        </div>
      </div>
    </div>
  `
})
export class PropertyEditComponent implements OnInit {
  property = signal<Property | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  icons = { ArrowLeft, Save, X };

  form = {
    titre: '',
    description: '',
    ville: '',
    commune: '',
    prix: 0,
    type: '',
    nombrePieces: null as number | null,
    surface: null as number | null
  };

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getProperty(id).subscribe({
      next: (p) => {
        this.property.set(p);
        this.form = {
          titre: p.titre,
          description: p.description,
          ville: p.ville,
          commune: p.commune,
          prix: p.prix,
          type: p.type,
          nombrePieces: p.nombrePieces,
          surface: p.surface
        };
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Annonce introuvable ou non autorisée');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    const p = this.property();
    if (!p) return;
    this.saving.set(true);
    this.propertyService.update(p.id, this.form as any).subscribe({
      next: () => {
        this.success.set(true);
        this.saving.set(false);
        setTimeout(() => this.router.navigate(['/owner/dashboard']), 1000);
      },
      error: (err) => {
        this.error.set('Erreur lors de la mise à jour');
        this.saving.set(false);
        console.error(err);
      }
    });
  }
}