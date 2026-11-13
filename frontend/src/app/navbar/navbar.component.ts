import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule, Home, Heart, Building2, Shield,
  LogOut, Menu, X, Sun, Moon, User, CreditCard, BarChart3
} from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <nav class="sticky top-0 z-50 bg-white/90 dark:bg-stone-950/90 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group">
            <img src="assets/logo-vio.svg" alt="VIO" class="h-10" />
          </a>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-1">
            @if (authService.isAuthenticated()) {
              @if (authService.getRole() === 'CLIENT') {
                <a routerLink="/" routerLinkActive="bg-stone-100 dark:bg-stone-800"
                   [routerLinkActiveOptions]="{exact: true}" class="btn-ghost">
                  <lucide-icon [img]="icons.Home" class="w-4 h-4"></lucide-icon>
                  Annonces
                </a>
                <a routerLink="/client/favorites" routerLinkActive="bg-stone-100 dark:bg-stone-800" class="btn-ghost">
                  <lucide-icon [img]="icons.Heart" class="w-4 h-4"></lucide-icon>
                  Favoris
                </a>
              }
              @if (authService.getRole() === 'OWNER') {
                <a routerLink="/owner/dashboard" routerLinkActive="bg-stone-100 dark:bg-stone-800" class="btn-ghost">
                  <lucide-icon [img]="icons.Building2" class="w-4 h-4"></lucide-icon>
                  Mes annonces
                </a>
                <a routerLink="/owner/stats" routerLinkActive="bg-stone-100 dark:bg-stone-800" class="btn-ghost">
                  <lucide-icon [img]="icons.BarChart3" class="w-4 h-4"></lucide-icon>
                  Stats
                </a>
                <a routerLink="/owner/subscription" routerLinkActive="bg-stone-100 dark:bg-stone-800" class="btn-ghost">
                  <lucide-icon [img]="icons.CreditCard" class="w-4 h-4"></lucide-icon>
                  Abonnement
                </a>
              }
              @if (authService.getRole() === 'ADMIN') {
                <a routerLink="/admin/dashboard" routerLinkActive="bg-stone-100 dark:bg-stone-800" class="btn-ghost">
                  <lucide-icon [img]="icons.Shield" class="w-4 h-4"></lucide-icon>
                  Admin
                </a>
              }
            } @else {
              <a routerLink="/" routerLinkActive="bg-stone-100 dark:bg-stone-800"
                 [routerLinkActiveOptions]="{exact: true}" class="btn-ghost">
                <lucide-icon [img]="icons.Home" class="w-4 h-4"></lucide-icon>
                Annonces
              </a>
            }

            <!-- Dark toggle -->
            <button (click)="theme.toggle()"
                    class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              @if (theme.isDark()) {
                <lucide-icon [img]="icons.Sun" class="w-4 h-4 text-stone-300"></lucide-icon>
              } @else {
                <lucide-icon [img]="icons.Moon" class="w-4 h-4 text-stone-600"></lucide-icon>
              }
            </button>

            @if (authService.isAuthenticated()) {
              <div class="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-1"></div>
              <a routerLink="/profile" class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  {{ authService.getInitiales() }}
                </div>
                <span class="text-sm font-medium text-stone-700 dark:text-stone-300 hidden lg:block">
                  {{ authService.getPrenom() }}
                </span>
              </a>
              <button (click)="authService.logout(); reload()"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-600 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 transition-colors text-sm font-medium"
                      title="Déconnexion">
                <lucide-icon [img]="icons.LogOut" class="w-4 h-4"></lucide-icon>
                <span class="hidden lg:block">Déconnexion</span>
              </button>
            } @else {
              <a routerLink="/login" class="btn-ghost">Connexion</a>
              <a routerLink="/register" class="btn-primary">S'inscrire</a>
            }
          </div>

          <!-- Mobile buttons -->
          <div class="flex items-center gap-1 md:hidden">
            <button (click)="theme.toggle()"
                    class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
              @if (theme.isDark()) {
                <lucide-icon [img]="icons.Sun" class="w-4 h-4 text-stone-300"></lucide-icon>
              } @else {
                <lucide-icon [img]="icons.Moon" class="w-4 h-4 text-stone-600"></lucide-icon>
              }
            </button>
            <button (click)="menuOpen.set(!menuOpen())"
                    class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
              <lucide-icon [img]="menuOpen() ? icons.X : icons.Menu" class="w-5 h-5 text-stone-700 dark:text-stone-300"></lucide-icon>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile menu -->
      @if (menuOpen()) {
        <div class="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
          <div class="px-4 py-3 space-y-1">
            @if (authService.isAuthenticated()) {
              <a routerLink="/profile" (click)="menuOpen.set(false)"
                 class="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  {{ authService.getInitiales() }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-stone-900 dark:text-white">
                    {{ authService.getPrenom() }} {{ authService.getNom() }}
                  </p>
                  <p class="text-xs text-stone-500 dark:text-stone-400">{{ roleLabel() }}</p>
                </div>
              </a>

              @if (authService.getRole() === 'CLIENT') {
                <a routerLink="/" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">
                  <lucide-icon [img]="icons.Home" class="w-4 h-4"></lucide-icon> Annonces
                </a>
                <a routerLink="/client/favorites" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">
                  <lucide-icon [img]="icons.Heart" class="w-4 h-4"></lucide-icon> Mes favoris
                </a>
              }
              @if (authService.getRole() === 'OWNER') {
                <a routerLink="/owner/dashboard" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">
                  <lucide-icon [img]="icons.Building2" class="w-4 h-4"></lucide-icon> Mes annonces
                </a>
                <a routerLink="/owner/subscription" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">
                  <lucide-icon [img]="icons.CreditCard" class="w-4 h-4"></lucide-icon> Mon abonnement
                </a>
                <a routerLink="/owner/stats" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">
                  <lucide-icon [img]="icons.BarChart3" class="w-4 h-4"></lucide-icon> Stats
                </a>
              }
              @if (authService.getRole() === 'ADMIN') {
                <a routerLink="/admin/dashboard" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">
                  <lucide-icon [img]="icons.Shield" class="w-4 h-4"></lucide-icon> Administration
                </a>
              }
              <button (click)="authService.logout(); reload()"
                      class="btn-ghost w-full justify-start text-red-600 dark:text-red-400">
                <lucide-icon [img]="icons.LogOut" class="w-4 h-4"></lucide-icon> Déconnexion
              </button>
            } @else {
              <a routerLink="/" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">
                <lucide-icon [img]="icons.Home" class="w-4 h-4"></lucide-icon> Annonces
              </a>
              <a routerLink="/login" (click)="menuOpen.set(false)" class="btn-ghost w-full justify-start">Connexion</a>
              <a routerLink="/register" (click)="menuOpen.set(false)" class="btn-primary w-full">S'inscrire</a>
            }
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  theme = inject(ThemeService);
  menuOpen = signal(false);

  icons = { Home, Heart, Building2, Shield, LogOut, Menu, X, Sun, Moon, User, CreditCard, BarChart3 };

  roleLabel(): string {
    const role = this.authService.getRole();
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'OWNER') return 'Propriétaire';
    if (role === 'CLIENT') return 'Client';
    return 'Utilisateur';
  }

  reload(): void {
    window.location.href = '/';
  }
}