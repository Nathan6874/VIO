import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Check, ArrowRight, Settings, Crown } from 'lucide-angular';
import { Subscription, SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4 relative overflow-hidden">

      <!-- Confetti subtle -->
      <div class="absolute inset-0 pointer-events-none">
        @for (c of confetti; track $index) {
          <div class="absolute animate-fall"
               [style.left.%]="c.left"
               [style.animation-delay.s]="c.delay"
               [style.animation-duration.s]="c.duration"
               [style.background]="c.color"
               [style.width.px]="c.size"
               [style.height.px]="c.size"
               [style.border-radius]="c.round ? '50%' : '2px'">
          </div>
        }
      </div>

      <div class="relative bg-white dark:bg-stone-900 rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-stone-200 dark:border-stone-800 z-10">
        <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <lucide-icon [img]="icons.Check" class="w-12 h-12 text-white"></lucide-icon>
        </div>

        <h1 class="text-3xl font-black text-stone-900 dark:text-white mb-3">
          @if (planName()) {
            Plan {{ planName() }} activé !
          } @else {
            Abonnement activé !
          }
        </h1>
        <p class="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
          @if (planName()) {
            Votre paiement a bien été confirmé. Vous pouvez dès maintenant profiter de toutes les fonctionnalités du plan {{ planName() }}.
          } @else {
            Votre abonnement est actif. Profitez de vos nouvelles fonctionnalités.
          }
        </p>

        <div class="space-y-3">
          <a routerLink="/owner/dashboard"
             class="btn-primary w-full">
            Mes annonces
            <lucide-icon [img]="icons.ArrowRight" class="w-4 h-4"></lucide-icon>
          </a>
          <a routerLink="/owner/subscription"
             class="btn-secondary w-full">
            <lucide-icon [img]="icons.Settings" class="w-4 h-4"></lucide-icon>
            Voir mon abonnement
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    .animate-fall {
      animation-name: fall;
      animation-timing-function: linear;
      animation-iteration-count: 1;
    }
  `]
})
export class SubscriptionSuccessComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  icons = { Check, ArrowRight, Settings, Crown };

  planName = signal<string | null>(null);
  confetti: any[] = [];

  ngOnInit(): void {
    // Charger le plan actif pour afficher son nom
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub: any) => {
        if (sub && sub.planName) {
          this.planName.set(sub.planName);
        }
      },
      error: () => { /* pas d'abonnement, on garde le message générique */ }
    });

    const colors = ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b'];
    for (let i = 0; i < 40; i++) {
      this.confetti.push({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        round: Math.random() > 0.5
      });
    }
  }
}