import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Eye, TrendingUp, BarChart3 } from 'lucide-angular';
import { AnalyticsService, PropertyStats } from '../services/analytics.service';

@Component({
  selector: 'app-owner-stats',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-stone-900 dark:text-white mb-2">Statistiques</h1>
        <p class="text-stone-500 dark:text-stone-400 mb-8">Suivez les performances de vos annonces</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="vio-card">
            <p class="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase mb-1">Total annonces</p>
            <p class="text-3xl font-black text-stone-900 dark:text-white">{{ stats().length }}</p>
          </div>
          <div class="vio-card">
            <p class="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase mb-1">Vues totales</p>
            <p class="text-3xl font-black text-blue-600 dark:text-blue-400">{{ totalViews() }}</p>
          </div>
          <div class="vio-card">
            <p class="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase mb-1">Moyenne par annonce</p>
            <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400">{{ avgViews() }}</p>
          </div>
        </div>

        <div class="vio-card">
          <h2 class="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <lucide-icon [img]="icons.BarChart3" class="w-5 h-5"></lucide-icon>
            Détail par annonce
          </h2>

          @if (stats().length === 0) {
            <p class="text-center text-stone-500 dark:text-stone-400 py-8">Aucune annonce</p>
          } @else {
            <div class="space-y-3">
              @for (s of sortedStats(); track s.propertyId) {
                <div class="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div class="flex-1">
                    <p class="font-bold text-stone-900 dark:text-white">{{ s.propertyTitre }}</p>
                  </div>
                  <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <lucide-icon [img]="icons.Eye" class="w-4 h-4"></lucide-icon>
                    <span class="font-bold text-lg">{{ s.viewCount }}</span>
                    <span class="text-xs text-stone-500 dark:text-stone-400">vues</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class OwnerStatsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats = signal<PropertyStats[]>([]);
  icons = { Eye, TrendingUp, BarChart3 };

  totalViews = () => this.stats().reduce((sum, s) => sum + s.viewCount, 0);
  avgViews = () => this.stats().length === 0 ? 0 : Math.round(this.totalViews() / this.stats().length);
  sortedStats = () => [...this.stats()].sort((a, b) => b.viewCount - a.viewCount);

  ngOnInit(): void {
    this.analyticsService.getMyStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error(err)
    });
  }
}