import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
  Mail, Lock, Search, Home, ArrowLeft, Check, Eye, EyeOff,
  Shield, Sparkles, Users, Zap, Star
} from 'lucide-angular';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      <!-- ═══════ PANNEAU GAUCHE (VISUEL) ═══════ -->
      <div class="hidden lg:flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-12 text-white">
        
        <!-- Décoration -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div class="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-36 -translate-x-36"></div>

        <div class="relative z-10 flex flex-col h-full">
          
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-16">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span class="text-2xl font-black">V</span>
            </div>
            <span class="text-2xl font-black">VIO</span>
          </div>

          <!-- Tagline -->
          <div class="flex-1 flex flex-col justify-center">
            <h1 class="text-4xl xl:text-5xl font-black mb-6 leading-tight">
              Rejoignez des<br>
              <span class="text-blue-200">milliers d'utilisateurs</span>
            </h1>
            <p class="text-xl text-white/80 mb-12 leading-relaxed">
              Trouvez votre prochain chez-vous ou publiez vos biens en toute simplicité.
            </p>

            <!-- Arguments -->
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="icons.Zap" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="font-bold text-lg">Visites 3D immersives</p>
                  <p class="text-white/70 text-sm">Explorez chaque pièce comme si vous y étiez.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="icons.Shield" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="font-bold text-lg">Propriétaires vérifiés</p>
                  <p class="text-white/70 text-sm">Tous nos biens sont modérés par notre équipe.</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="icons.Users" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="font-bold text-lg">Contact direct WhatsApp</p>
                  <p class="text-white/70 text-sm">Pas d'intermédiaire. Vous parlez au propriétaire.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats en bas -->
          <div class="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/20">
            <div>
              <p class="text-3xl font-black">500+</p>
              <p class="text-sm text-white/70">Propriétaires</p>
            </div>
            <div>
              <p class="text-3xl font-black">1 200+</p>
              <p class="text-sm text-white/70">Annonces</p>
            </div>
            <div>
              <p class="text-3xl font-black">8 400+</p>
              <p class="text-sm text-white/70">Visites</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════ PANNEAU DROIT (FORMULAIRE) ═══════ -->
      <div class="flex flex-col bg-white dark:bg-stone-950 p-6 sm:p-12 overflow-y-auto">

        <!-- Lien retour (mobile) -->
        <a routerLink="/" class="lg:hidden inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white mb-6">
          <lucide-icon [img]="icons.ArrowLeft" class="w-4 h-4"></lucide-icon>
          Retour
        </a>

        <div class="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">

          <!-- Header mobile -->
          <div class="lg:hidden text-center mb-8">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg mb-4">
              <span class="text-white font-black text-2xl">V</span>
            </div>
            <h1 class="text-2xl font-black text-stone-900 dark:text-white">Rejoindre VIO</h1>
          </div>

          <!-- Header desktop -->
          <div class="hidden lg:block mb-8">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-4">
              <lucide-icon [img]="icons.Sparkles" class="w-3.5 h-3.5"></lucide-icon>
              Inscription gratuite en 30 secondes
            </div>
            <h2 class="text-3xl font-black text-stone-900 dark:text-white mb-2">
              Créer votre compte
            </h2>
            <p class="text-stone-500 dark:text-stone-400">
              Choisissez votre profil et commencez dès maintenant.
            </p>
          </div>

          <!-- Choix du rôle (cards) -->
          <div class="mb-6">
            <label class="label mb-3">Je suis…</label>
            <div class="grid grid-cols-2 gap-3">
              
              <button type="button" (click)="role.set('CLIENT')"
                      class="relative p-4 rounded-2xl border-2 transition-all text-left group"
                      [class.border-blue-500]="role() === 'CLIENT'"
                      [class.bg-blue-50]="role() === 'CLIENT'"
                      [class.dark:bg-blue-950/40]="role() === 'CLIENT'"
                      [class.border-stone-200]="role() !== 'CLIENT'"
                      [class.dark:border-stone-700]="role() !== 'CLIENT'"
                      [class.hover:border-blue-300]="role() !== 'CLIENT'">
                @if (role() === 'CLIENT') {
                  <div class="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <lucide-icon [img]="icons.Check" class="w-3 h-3 text-white"></lucide-icon>
                  </div>
                }
                <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <lucide-icon [img]="icons.Search" class="w-5 h-5 text-blue-600 dark:text-blue-400"></lucide-icon>
                </div>
                <p class="text-sm font-bold text-stone-900 dark:text-white">Je cherche</p>
                <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">un logement</p>
              </button>

              <button type="button" (click)="role.set('OWNER')"
                      class="relative p-4 rounded-2xl border-2 transition-all text-left group"
                      [class.border-blue-500]="role() === 'OWNER'"
                      [class.bg-blue-50]="role() === 'OWNER'"
                      [class.dark:bg-blue-950/40]="role() === 'OWNER'"
                      [class.border-stone-200]="role() !== 'OWNER'"
                      [class.dark:border-stone-700]="role() !== 'OWNER'"
                      [class.hover:border-blue-300]="role() !== 'OWNER'">
                @if (role() === 'OWNER') {
                  <div class="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <lucide-icon [img]="icons.Check" class="w-3 h-3 text-white"></lucide-icon>
                  </div>
                }
                <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <lucide-icon [img]="icons.Home" class="w-5 h-5 text-blue-600 dark:text-blue-400"></lucide-icon>
                </div>
                <p class="text-sm font-bold text-stone-900 dark:text-white">Je publie</p>
                <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">des biens</p>
              </button>
            </div>
          </div>

          <!-- Formulaire -->
          <form (ngSubmit)="onSubmit()" class="space-y-4">

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Prénom</label>
                <input type="text" [(ngModel)]="form.prenom" name="prenom" required
                       placeholder="Jean"
                       class="input" />
              </div>
              <div>
                <label class="label">Nom</label>
                <input type="text" [(ngModel)]="form.nom" name="nom" required
                       placeholder="Dubus"
                       class="input" />
              </div>
            </div>

            <div>
              <label class="label">Numéro WhatsApp</label>
              <div class="relative">
                <lucide-icon [img]="icons.Mail" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input type="text" [(ngModel)]="form.whatsapp" name="whatsapp" required
                       placeholder="+225 01 02 03 04"
                       class="input pl-10" />
              </div>
            </div>

            <div>
              <label class="label">Mot de passe</label>
              <div class="relative">
                <lucide-icon [img]="icons.Lock" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input [type]="showPassword() ? 'text' : 'password'"
                       [(ngModel)]="form.password" name="password" required minlength="6"
                       placeholder="Min. 6 caractères"
                       class="input pl-10 pr-10" />
                <button type="button" (click)="showPassword.set(!showPassword())"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  @if (showPassword()) {
                    <lucide-icon [img]="icons.EyeOff" class="w-4 h-4"></lucide-icon>
                  } @else {
                    <lucide-icon [img]="icons.Eye" class="w-4 h-4"></lucide-icon>
                  }
                </button>
              </div>
              @if (form.password && form.password.length < 6) {
                <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {{ 6 - form.password.length }} caractère(s) manquant(s)
                </p>
              }
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

            <button type="submit" [disabled]="loading() || !isFormValid()"
                    class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2">
              @if (loading()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Création…
              } @else {
                Créer mon compte gratuitement
              }
            </button>

            <p class="text-center text-xs text-stone-400 dark:text-stone-500 leading-relaxed">
              En créant un compte, vous acceptez nos
              <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">conditions d'utilisation</a>
              et notre
              <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">politique de confidentialité</a>.
            </p>
          </form>

          <!-- Lien connexion -->
          <p class="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
            Déjà un compte ?
            <a routerLink="/login" class="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Se connecter</a>
          </p>

          <!-- Trust badges -->
          <div class="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
            <div class="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <lucide-icon [img]="icons.Shield" class="w-3.5 h-3.5 text-emerald-500"></lucide-icon>
              Sécurisé
            </div>
            <div class="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <lucide-icon [img]="icons.Check" class="w-3.5 h-3.5 text-emerald-500"></lucide-icon>
              100% gratuit
            </div>
            <div class="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <lucide-icon [img]="icons.Star" class="w-3.5 h-3.5 text-amber-500"></lucide-icon>
              Sans engagement
            </div>
          </div>
        </div>
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
  showPassword = signal(false);

  icons = {
    Mail, Lock, Search, Home, ArrowLeft, Check, Eye, EyeOff,
    Shield, Sparkles, Users, Zap, Star
  };

  isFormValid = computed(() => {
    return this.form.nom.trim().length > 0
      && this.form.prenom.trim().length > 0
      && this.form.whatsapp.trim().length > 0
      && this.form.password.length >= 6;
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
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