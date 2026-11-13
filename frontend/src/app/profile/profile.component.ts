import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, User, Phone, Save, Lock, Check, Pencil, X, Shield } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  whatsapp: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div class="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">

        <!-- En-tête -->
        <div class="mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">Mon profil</h1>
          <p class="text-sm sm:text-base text-stone-500 dark:text-stone-400 mt-1 sm:mt-2">Gérez vos informations personnelles</p>
        </div>

        <!-- Carte profil -->
        <div class="vio-card mb-6">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-6 border-b border-stone-200 dark:border-stone-800">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg flex-shrink-0">
              {{ authService.getInitiales() }}
            </div>
            <div class="flex-1 text-center sm:text-left">
              <h2 class="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                {{ profile()?.prenom }} {{ profile()?.nom }}
              </h2>
              <p class="text-sm text-stone-500 dark:text-stone-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <lucide-icon [img]="icons.Phone" class="w-3.5 h-3.5"></lucide-icon>
                {{ profile()?.whatsapp }}
              </p>
              <span class="badge-info mt-2 inline-flex">{{ roleLabel() }}</span>
            </div>
          </div>

          <!-- Mode VIEW -->
          @if (!editMode()) {
            <div class="pt-6 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Prénom</p>
                  <p class="text-base font-medium text-stone-900 dark:text-white">{{ profile()?.prenom }}</p>
                </div>
                <div>
                  <p class="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Nom</p>
                  <p class="text-base font-medium text-stone-900 dark:text-white">{{ profile()?.nom }}</p>
                </div>
              </div>

              <button (click)="editMode.set(true)" class="btn-primary w-full sm:w-auto">
                <lucide-icon [img]="icons.Pencil" class="w-4 h-4"></lucide-icon>
                Modifier mes informations
              </button>
            </div>
          } @else {
            <!-- Mode EDIT -->
            <div class="pt-6 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="label">Prénom</label>
                  <input type="text" [(ngModel)]="form.prenom" class="input" />
                </div>
                <div>
                  <label class="label">Nom</label>
                  <input type="text" [(ngModel)]="form.nom" class="input" />
                </div>
              </div>
              <div>
                <label class="label">WhatsApp (non modifiable)</label>
                <input type="text" [value]="profile()?.whatsapp" disabled
                       class="input opacity-60 cursor-not-allowed" />
              </div>

              @if (updateMessage()) {
                <p class="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <lucide-icon [img]="icons.Check" class="w-4 h-4"></lucide-icon>
                  {{ updateMessage() }}
                </p>
              }
              @if (updateError()) {
                <p class="text-sm text-red-600 dark:text-red-400">{{ updateError() }}</p>
              }

              <div class="flex flex-col sm:flex-row gap-2">
                <button (click)="saveProfile()" [disabled]="updating()" class="btn-primary flex-1 sm:flex-none">
                  <lucide-icon [img]="icons.Save" class="w-4 h-4"></lucide-icon>
                  {{ updating() ? 'Sauvegarde…' : 'Sauvegarder' }}
                </button>
                <button (click)="cancelEdit()" [disabled]="updating()" class="btn-secondary flex-1 sm:flex-none">
                  <lucide-icon [img]="icons.X" class="w-4 h-4"></lucide-icon>
                  Annuler
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Carte mot de passe -->
        <div class="vio-card">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <lucide-icon [img]="icons.Lock" class="w-5 h-5 text-amber-600 dark:text-amber-400"></lucide-icon>
              Mot de passe
            </h3>
            @if (!showPasswordForm()) {
              <button (click)="showPasswordForm.set(true)" class="btn-secondary">
                <lucide-icon [img]="icons.Lock" class="w-4 h-4"></lucide-icon>
                Changer le mot de passe
              </button>
            }
        </div>

  @if (showPasswordForm()) {
    <div class="space-y-4 mt-4">
      <div>
        <label class="label">Nouveau mot de passe (min. 6 caractères)</label>
        <input type="password" [(ngModel)]="passwordForm.newPassword" class="input" />
      </div>
      <div>
        <label class="label">Confirmer le mot de passe</label>
        <input type="password" [(ngModel)]="passwordForm.confirmPassword" class="input" />
      </div>

      @if (passwordMessage()) {
        <p class="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <lucide-icon [img]="icons.Check" class="w-4 h-4"></lucide-icon>
          {{ passwordMessage() }}
        </p>
      }
      @if (passwordError()) {
        <p class="text-sm text-red-600 dark:text-red-400">{{ passwordError() }}</p>
      }

      <div class="flex gap-2">
        <button (click)="changePassword()" [disabled]="changingPassword()" class="btn-primary">
          <lucide-icon [img]="icons.Lock" class="w-4 h-4"></lucide-icon>
          {{ changingPassword() ? 'Modification…' : 'Confirmer' }}
        </button>
        <button (click)="cancelPassword()" class="btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  }
</div>

      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);

  icons = { User, Phone, Save, Lock, Check, Pencil, X, Shield };

  profile = signal<UserProfile | null>(null);
  editMode = signal(false);
  updating = signal(false);
  updateMessage = signal<string | null>(null);
  updateError = signal<string | null>(null);

  changingPassword = signal(false);
  passwordMessage = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  showPasswordForm = signal(false);

  form = { nom: '', prenom: '' };
  passwordForm = { newPassword: '', confirmPassword: '' };

  private apiUrl = `${environment.apiUrl}/api/profile`;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.http.get<UserProfile>(`${this.apiUrl}/me`).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.form.nom = data.nom;
        this.form.prenom = data.prenom;
      },
      error: (err) => console.error(err)
    });
  }

  roleLabel(): string {
    const role = this.profile()?.role;
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'OWNER') return 'Propriétaire';
    if (role === 'CLIENT') return 'Client';
    return role || '';
  }

  cancelEdit(): void {
    const p = this.profile();
    if (p) {
      this.form.nom = p.nom;
      this.form.prenom = p.prenom;
    }
    this.editMode.set(false);
    this.updateMessage.set(null);
    this.updateError.set(null);
  }

  saveProfile(): void {
    this.updating.set(true);
    this.updateMessage.set(null);
    this.updateError.set(null);

    this.http.put<UserProfile>(`${this.apiUrl}/me`, this.form).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.updating.set(false);
        this.editMode.set(false);
        this.updateMessage.set('Profil mis à jour');
        setTimeout(() => this.updateMessage.set(null), 3000);
      },
      error: (err) => {
        this.updating.set(false);
        this.updateError.set('Erreur lors de la mise à jour');
      }
    });
  }

  cancelPassword(): void {
    this.showPasswordForm.set(false);
    this.passwordForm = { newPassword: '', confirmPassword: '' };
    this.passwordMessage.set(null);
    this.passwordError.set(null);
  }

  changePassword(): void {
    this.passwordMessage.set(null);
    this.passwordError.set(null);

    if (!this.passwordForm.newPassword) {
      this.passwordError.set('Le nouveau mot de passe est requis');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.changingPassword.set(true);
    this.http.put(`${this.apiUrl}/me/password`, {
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordMessage.set('Mot de passe modifié');
        this.passwordForm = { newPassword: '', confirmPassword: '' };
        this.showPasswordForm.set(false);
        setTimeout(() => this.passwordMessage.set(null), 3000);
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.passwordError.set(err?.error?.message || 'Erreur');
      }
    });
  }
}