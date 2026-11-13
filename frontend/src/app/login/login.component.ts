import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Mail, Lock, ArrowLeft } from 'lucide-angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="vio-card">
          <div class="text-center mb-8">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg mb-4">
              <span class="text-white font-black text-2xl">V</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mb-2">Bienvenue sur VIO</h1>
            <p class="text-sm text-stone-500 dark:text-stone-400">Connectez-vous pour continuer</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="label">Numéro WhatsApp</label>
              <div class="relative">
                <lucide-icon [img]="icons.Mail" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input type="text" [(ngModel)]="whatsapp" name="whatsapp" required
                       placeholder="+22501020304"
                       class="input pl-10" />
              </div>
            </div>

            <div>
              <label class="label">Mot de passe</label>
              <div class="relative">
                <lucide-icon [img]="icons.Lock" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input type="password" [(ngModel)]="password" name="password" required
                       placeholder="••••••••"
                       class="input pl-10" />
              </div>
            </div>

            @if (error()) {
              <div class="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
                {{ error() }}
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn-primary w-full">
              {{ loading() ? 'Connexion…' : 'Se connecter' }}
            </button>
          </form>

          <p class="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
            Pas encore de compte ?
            <a routerLink="/register" class="text-blue-600 dark:text-blue-400 hover:underline font-semibold">S'inscrire</a>
          </p>
        </div>

        <p class="text-center mt-6">
          <a routerLink="/" class="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 inline-flex items-center gap-1">
            <lucide-icon [img]="icons.ArrowLeft" class="w-3.5 h-3.5"></lucide-icon>
            Retour aux annonces
          </a>
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

  icons = { Mail, Lock, ArrowLeft };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.whatsapp.trim() || !this.password) {
      this.error.set('Tous les champs sont requis');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.whatsapp, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Identifiants invalides');
      }
    });
  }
}