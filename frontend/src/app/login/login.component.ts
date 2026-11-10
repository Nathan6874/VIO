import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">VIO</h1>
          <p class="text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="text"
              [(ngModel)]="whatsapp"
              name="whatsapp"
              required
              placeholder="+22501020304"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          @if (error()) {
            <p class="text-red-600 text-sm">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition">
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          <a routerLink="/" class="text-blue-600 hover:text-blue-800">← Retour aux annonces</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {

  whatsapp = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.whatsapp, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Identifiants invalides');
        console.error(err);
      }
    });
  }
}