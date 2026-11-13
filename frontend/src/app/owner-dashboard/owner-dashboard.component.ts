import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, MapPin, Eye, TrendingUp, Sparkles } from 'lucide-angular';
import { Property } from '../models/property.model';
import { PropertyService } from '../services/property.service';
import { Subscription, SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950">
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- En-tête avec titre + badge plan + bouton -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-page-title">Mes annonces</h1>
            @if (currentSubscription(); as sub) {
              <div class="flex items-center gap-2 mt-2">
                <span class="badge-success">
                  ✓ Plan {{ sub.planName }}
                </span>
                <a routerLink="/owner/subscription" class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Gérer
                </a>
              </div>
            } @else {
              <a routerLink="/owner/subscription" class="inline-flex items-center gap-1 badge-info mt-2 hover:opacity-80 transition">
                <lucide-icon [img]="icons.Sparkles" class="w-3 h-3"></lucide-icon>
                Choisir un abonnement →
              </a>
            }
          </div>
          <a routerLink="/owner/properties/new" class="btn-primary whitespace-nowrap">
            <lucide-icon [img]="icons.Plus" class="w-4 h-4"></lucide-icon>
            Nouvelle annonce
          </a>
        </div>

        <!-- Stats rapides -->
        @if (properties().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div class="vio-card">
              <p class="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wide mb-1">Total annonces</p>
              <p class="text-3xl font-black text-stone-900 dark:text-white">{{ properties().length }}</p>
            </div>
            <div class="vio-card">
              <p class="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wide mb-1">Approuvées</p>
              <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400">{{ countByStatus('APPROVED') }}</p>
            </div>
            <div class="vio-card col-span-2 md:col-span-1">
              <p class="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wide mb-1">En attente</p>
              <p class="text-3xl font-black text-amber-600 dark:text-amber-400">{{ countByStatus('PENDING') }}</p>
            </div>
          </div>
        }

        <!-- Contenu -->
        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3]; track i) {
              <div class="vio-card animate-pulse">
                <div class="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-3"></div>
                <div class="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2 mb-4"></div>
                <div class="h-8 bg-stone-200 dark:bg-stone-700 rounded w-1/3"></div>
              </div>
            }
          </div>
        } @else if (error()) {
          <div class="vio-card text-center py-12">
            <p class="text-red-600 dark:text-red-400">{{ error() }}</p>
          </div>
        } @else if (properties().length === 0) {
          <div class="vio-card text-center py-16">
            <div class="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon [img]="icons.TrendingUp" class="w-10 h-10 text-stone-400 dark:text-stone-500"></lucide-icon>
            </div>
            <h2 class="text-xl font-bold text-stone-900 dark:text-white mb-2">Vous n'avez pas encore d'annonce</h2>
            <p class="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
              Publiez votre première annonce et attirez des locataires grâce à la visite 3D immersive.
            </p>
            <a routerLink="/owner/properties/new" class="btn-primary inline-flex">
              <lucide-icon [img]="icons.Plus" class="w-4 h-4"></lucide-icon>
              Créer ma première annonce
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (p of properties(); track p.id) {
              <a [routerLink]="['/properties', p.id]"
                 class="group vio-card hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all cursor-pointer block">

                <div class="flex items-start justify-between mb-3">
                  <span class="badge"
                        [class.badge-success]="p.status === 'APPROVED'"
                        [class.badge-warning]="p.status === 'PENDING'"
                        [class.badge-danger]="p.status === 'REJECTED'">
                    {{ p.status }}
                  </span>
                  <span class="text-xs text-stone-500 dark:text-stone-400">
                    {{ p.type }}
                  </span>
                </div>

                <h3 class="text-lg font-bold text-stone-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ p.titre }}
                </h3>

                <div class="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 mb-3">
                  <lucide-icon [img]="icons.MapPin" class="w-3.5 h-3.5"></lucide-icon>
                  {{ p.commune }}, {{ p.ville }}
                </div>

                <p class="text-xs text-stone-400 dark:text-stone-500 mb-4">
                  {{ p.nombrePieces ?? '?' }} pièces · {{ p.surface ?? '?' }} m²
                </p>

                <div class="flex items-end justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                  <p class="text-2xl font-black text-stone-900 dark:text-white">
                    {{ p.prix.toLocaleString('fr-FR') }}
                    <span class="text-sm font-medium text-stone-500">FCFA</span>
                  </p>
                  <lucide-icon [img]="icons.Eye" class="w-4 h-4 text-stone-400 dark:text-stone-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></lucide-icon>
                </div>
              </a>
            }
          </div>
        }

      </main>
    </div>
  `
})
export class OwnerDashboardComponent implements OnInit {

  properties = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  currentSubscription = signal<Subscription | null>(null);

  icons = { Plus, MapPin, Eye, TrendingUp, Sparkles };

  constructor(
    private propertyService: PropertyService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub) => {
        if ('id' in sub) this.currentSubscription.set(sub);
      },
      error: () => { /* pas d'abonnement */ }
    });

    this.propertyService.getMyProperties().subscribe({
      next: (data) => {
        this.properties.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de vos annonces');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  countByStatus(status: string): number {
    return this.properties().filter(p => p.status === status).length;
  }
}