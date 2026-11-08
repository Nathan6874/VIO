import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../services/property.service';
import { CreatePropertyRequest } from '../models/property.model';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <a routerLink="/owner/dashboard" class="back">← Retour</a>

    <div class="container">
      <h1>Nouvelle annonce</h1>

      <form (ngSubmit)="onSubmit()">
        <label>
          Titre *
          <input type="text" [(ngModel)]="form.titre" name="titre" required />
        </label>

        <label>
          Description *
          <textarea [(ngModel)]="form.description" name="description" rows="3" required></textarea>
        </label>

        <div class="row">
          <label>
            Ville *
            <input type="text" [(ngModel)]="form.ville" name="ville" required />
          </label>
          <label>
            Commune *
            <input type="text" [(ngModel)]="form.commune" name="commune" required />
          </label>
        </div>

        <div class="row">
          <label>
            Prix (FCFA) *
            <input type="number" [(ngModel)]="form.prix" name="prix" required min="0" />
          </label>
          <label>
            Type *
            <select [(ngModel)]="form.type" name="type" required>
              <option value="APPARTEMENT">Appartement</option>
              <option value="VILLA">Villa</option>
              <option value="STUDIO">Studio</option>
              <option value="TERRAIN">Terrain</option>
              <option value="BUREAU">Bureau</option>
              <option value="AUTRE">Autre</option>
            </select>
          </label>
        </div>

        <div class="row">
          <label>
            Nombre de pièces
            <input type="number" [(ngModel)]="form.nombrePieces" name="nombrePieces" min="0" />
          </label>
          <label>
            Surface (m²)
            <input type="number" [(ngModel)]="form.surface" name="surface" min="0" step="0.1" />
          </label>
        </div>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Création…' : "Créer l'annonce" }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .back { display: inline-block; padding: 1rem 2rem; color: #007bff; text-decoration: none; }
    .back:hover { text-decoration: underline; }
    .container { max-width: 700px; margin: 1rem auto; padding: 0 2rem; }
    h1 { margin-bottom: 1.5rem; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: flex; flex-direction: column; font-weight: bold; font-size: 0.9rem; }
    input, textarea, select { padding: 0.5rem; margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; }
    textarea { resize: vertical; }
    button { padding: 0.8rem; background: #007bff; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
    button:hover:not(:disabled) { background: #0056b3; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .error { color: red; }
  `]
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

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {
  }

  onSubmit(): void {
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
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/owner/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set("Erreur lors de la création de l'annonce");
        console.error(err);
      }
    });
  }
}