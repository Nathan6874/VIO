import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Mail, Lock, Search, Home, ArrowLeft } from 'lucide-angular';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div class="vio-card">
          <div class="text-center mb-6">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg mb-4">
              <span class="text-white font-black text-2xl">V</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mb-2">Rejoindre VIO</h1>
            <p class="text-sm text-stone-500 dark:text-stone-400">Choisissez votre profil</p>
          </div>

          <!-- Choix du rôle -->
          <div class="grid grid-cols-2 gap-3 mb-6">
            <button type="button" (click)="role.set('CLIENT')"
                    class="p-3 rounded-xl border-2 transition-all text-left"
                    [class.border-blue-500]="role() === 'CLIENT'"
                    [class.bg-blue-50]="role() === 'CLIENT'"
                    [class.dark:bg-blue-950]="role() === 'CLIENT'"
                    [class.border-stone-200]="role() !== 'CLIENT'"
                    [class.dark:border-stone-700]="role() !== 'CLIENT'">
              <div class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <lucide-icon [img]="icons.Search" class="w-4 h-4 text-blue-600 dark:text-blue-400"></lucide-icon>
              </div>
              <p class="text-sm font-bold text-stone-900 dark:text-white">Je cherche</p>
              <p class="text-xs text-stone-500 dark:text-stone-400">un logement</p>
            </button>

            <button type="button" (click)="role.set('OWNER')"
                    class="p-3 rounded-xl border-2 transition-all text-left"
                    [class.border-blue-500]="role() === 'OWNER'"
                    [class.bg-blue-50]="role() === 'OWNER'"
                    [class.dark:bg-blue-950]="role() === 'OWNER'"
                    [class.border-stone-200]="role() !== 'OWNER'"
                    [class.dark:border-stone-700]="role() !== 'OWNER'">
              <div class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <lucide-icon [img]="icons.Home" class="w-4 h-4 text-blue-600 dark:text-blue-400"></lucide-icon>
              </div>
              <p class="text-sm font-bold text-stone-900 dark:text-white">Je publie</p>
              <p class="text-xs text-stone-500 dark:text-stone-400">des biens</p>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Prénom</label>
                <input type="text" [(ngModel)]="form.prenom" name="prenom" required class="input" />
              </div>
              <div>
                <label class="label">Nom</label>
                <input type="text" [(ngModel)]="form.nom" name="nom" required class="input" />
              </div>
            </div>

            <div>
              <label class="label">WhatsApp</label>
              <div class="relative">
                <lucide-icon [img]="icons.Mail" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input type="text" [(ngModel)]="form.whatsapp" name="whatsapp" required
                       placeholder="+22501020304" class="input pl-10" />
              </div>
            </div>

            <div>
              <label class="label">Mot de passe</label>
              <div class="relative">
                <lucide-icon [img]="icons.Lock" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input type="password" [(ngModel)]="form.password" name="password" required minlength="6"
                       placeholder="Min. 6 caractères" class="input pl-10" />
              </div>
            </div>

            @if (error()) {
              <div class="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
                {{ error() }}
              </div>
            }
            @if (success()) {
              <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm">
                {{ success() }}
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn-primary w-full">
              {{ loading() ? 'Création…' : 'Créer mon compte' }}
            </button>
          </form>

          <p class="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
            Déjà un compte ?
            <a routerLink="/login" class="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Se connecter</a>
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
export class RegisterComponent {

  form = { nom: '', prenom: '', whatsapp: '', password: '' };
  role = signal<'CLIENT' | 'OWNER'>('CLIENT');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  icons = { Mail, Lock, Search, Home, ArrowLeft };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.form.nom.trim() || !this.form.prenom.trim()
        || !this.form.whatsapp.trim() || this.form.password.length < 6) {
      this.error.set('Tous les champs sont requis (mot de passe min. 6 caractères)');
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
        this.success.set('Compte créé ! Redirection…');
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('Ce numéro WhatsApp est déjà utilisé');
        } else {
          this.error.set('Erreur lors de la création');
        }
      }
    });
  }
}