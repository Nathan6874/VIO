import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">VIO</h1>
          <p class="text-gray-500 mt-2">Créer un compte</p>
        </div>

        <!-- Choix du rôle -->
        <div class="grid grid-cols-2 gap-2 mb-6">
          <button type="button"
                  (click)="role.set('CLIENT')"
                  [class.ring-2]="role() === 'CLIENT'"
                  [class.ring-blue-500]="role() === 'CLIENT'"
                  [class.bg-blue-50]="role() === 'CLIENT'"
                  class="border border-gray-300 rounded-md p-3 text-left transition">
            <p class="text-2xl mb-1">🔍</p>
            <p class="text-sm font-semibold text-gray-900">Je cherche</p>
            <p class="text-xs text-gray-500">un logement</p>
          </button>
          <button type="button"
                  (click)="role.set('OWNER')"
                  [class.ring-2]="role() === 'OWNER'"
                  [class.ring-blue-500]="role() === 'OWNER'"
                  [class.bg-blue-50]="role() === 'OWNER'"
                  class="border border-gray-300 rounded-md p-3 text-left transition">
            <p class="text-2xl mb-1">🏠</p>
            <p class="text-sm font-semibold text-gray-900">Je publie</p>
            <p class="text-xs text-gray-500">des biens</p>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input type="text" [(ngModel)]="form.prenom" name="prenom" required
                     class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" [(ngModel)]="form.nom" name="nom" required
                     class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
            <input type="text" [(ngModel)]="form.whatsapp" name="whatsapp" required
                   placeholder="+22501020304"
                   class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input type="password" [(ngModel)]="form.password" name="password" required minlength="6"
                   class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          @if (error()) {
            <p class="text-red-600 text-sm">{{ error() }}</p>
          }
          @if (success()) {
            <p class="text-green-600 text-sm">{{ success() }}</p>
          }

          <button type="submit" [disabled]="loading()"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition">
            {{ loading() ? 'Création…' : 'Créer mon compte' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?
          <a routerLink="/login" class="text-blue-600 hover:text-blue-800 font-medium">Se connecter</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {

  form = {
    nom: '',
    prenom: '',
    whatsapp: '',
    password: ''
  };

  role = signal<'CLIENT' | 'OWNER'>('CLIENT');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
  }

  onSubmit(): void {
    if (!this.form.nom.trim() || !this.form.prenom.trim()
        || !this.form.whatsapp.trim() || this.form.password.length < 6) {
      this.error.set('Tous les champs sont obligatoires (mot de passe min. 6 caractères)');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const url = this.role() === 'CLIENT'
      ? `${environment.apiUrl}/api/auth/register/client`
      : `${environment.apiUrl}/api/auth/register`;

    this.http.post(url, this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Compte créé ! Redirection vers la connexion…');
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('Ce numéro WhatsApp est déjà utilisé');
        } else {
          this.error.set('Erreur lors de la création du compte');
        }
        console.error(err);
      }
    });
  }
}