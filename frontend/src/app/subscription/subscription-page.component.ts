import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule, Check, Crown, Sparkles, Zap, Calendar, TrendingUp,
  CreditCard, ChevronRight, Star, Shield, ArrowLeft,
  XCircle, History, AlertCircle, PartyPopper, Quote
} from 'lucide-angular';
import { Plan, Subscription, SubscriptionService } from '../services/subscription.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmModalComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">

      <!-- Header -->
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a routerLink="/owner/dashboard" class="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold">
          <lucide-icon [img]="icons.ArrowLeft" class="w-4 h-4"></lucide-icon>
          Retour
        </a>
        <h1 class="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white mt-2">Mon abonnement</h1>
      </div>

      <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        <!-- Bandeau abonnement actuel -->
        @if (currentSubscription(); as sub) {
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 shadow-2xl shadow-emerald-500/20 mb-12 group">
            <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div class="absolute bottom-0 right-32 w-48 h-48 bg-white/10 rounded-full translate-y-24"></div>

            <div class="relative flex flex-col md:flex-row items-start justify-between gap-6">
              <div class="flex items-start gap-5">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30 shadow-lg">
                  <lucide-icon [img]="icons.Crown" class="w-8 h-8 text-white"></lucide-icon>
                </div>
                <div>
                  <p class="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">Plan actif</p>
                  <h2 class="text-4xl font-black text-white mb-2">{{ sub.planName }}</h2>
                  <div class="flex flex-wrap items-center gap-3 text-sm text-white/90">
                    <span class="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                      <lucide-icon [img]="icons.Calendar" class="w-4 h-4"></lucide-icon>
                      Jusqu'au {{ sub.endDate ? (sub.endDate | date:'dd/MM/yyyy') : '∞' }}
                    </span>
                    @if (daysLeft() > 0) {
                      <span class="bg-white text-emerald-700 font-bold px-3 py-1 rounded-full shadow-sm">
                        {{ daysLeft() }} jour{{ daysLeft() > 1 ? 's' : '' }} restant{{ daysLeft() > 1 ? 's' : '' }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <button (click)="askCancel()"
                      [disabled]="cancelling()"
                      class="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold px-4 py-2.5 rounded-xl border border-white/30 transition shadow-sm">
                <lucide-icon [img]="icons.XCircle" class="w-5 h-5"></lucide-icon>
                {{ cancelling() ? 'Annulation…' : 'Annuler mon abonnement' }}
              </button>
            </div>

            <div class="relative mt-6 pt-6 border-t border-white/20">
              <p class="text-sm text-white/80 flex items-center gap-2">
                <lucide-icon [img]="icons.AlertCircle" class="w-4 h-4"></lucide-icon>
                Votre abonnement reste actif jusqu'à sa date d'expiration. Vous pouvez souscrire à nouveau à tout moment.
              </p>
            </div>
          </div>
        } @else {
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-10 shadow-2xl shadow-purple-500/20 mb-12 text-center">
            <div class="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-24 -translate-y-24"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32"></div>

            <div class="relative">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
                <lucide-icon [img]="icons.Sparkles" class="w-10 h-10 text-white"></lucide-icon>
              </div>
              <h2 class="text-4xl font-black text-white mb-3">Passez au niveau supérieur</h2>
              <p class="text-white/80 text-lg max-w-xl mx-auto">
                Publiez plus d'annonces, ajoutez des visites 3D, et démarquez-vous avec VIO Premium.
              </p>
            </div>
          </div>
        }

        <!-- Cartes des plans -->
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-black text-stone-900 dark:text-white">Choisir un plan</h2>
          <p class="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <lucide-icon [img]="icons.Shield" class="w-4 h-4"></lucide-icon>
            Annulable à tout moment
          </p>
        </div>

        @if (loading()) {
          <div class="text-center py-20">
            <div class="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p class="text-stone-500 mt-4">Chargement des plans…</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            @for (plan of plans(); track plan.id) {
              <div class="relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg border-2 overflow-hidden flex flex-col transition-all duration-500"
                   [class.border-blue-500]="isCurrentPlan(plan)"
                   [class.border-transparent]="!isCurrentPlan(plan)"
                   [class.ring-4]="isCurrentPlan(plan)"
                   [class.ring-blue-200]="isCurrentPlan(plan)">

                @if (isCurrentPlan(plan)) {
                  <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold text-center py-2.5 tracking-widest flex items-center justify-center gap-1.5">
                    <lucide-icon [img]="icons.Check" class="w-4 h-4"></lucide-icon>
                    PLAN ACTUEL
                  </div>
                } @else if (plan.code === 'STD') {
                  <div class="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-xs font-bold text-center py-2.5 tracking-widest flex items-center justify-center gap-1.5">
                    <lucide-icon [img]="icons.Star" class="w-3.5 h-3.5"></lucide-icon>
                    LE PLUS POPULAIRE
                  </div>
                } @else if (plan.code === 'PRO') {
                  <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold text-center py-2.5 tracking-widest flex items-center justify-center gap-1.5">
                    <lucide-icon [img]="icons.Crown" class="w-3.5 h-3.5"></lucide-icon>
                    PREMIUM
                  </div>
                } @else {
                  <div class="h-10"></div>
                }

                <div class="p-7 flex-1 flex flex-col">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-2xl font-black text-stone-900 dark:text-white">{{ plan.name }}</h3>
                  </div>
                  <p class="text-sm text-stone-500 dark:text-slate-400 mb-6">{{ plan.description }}</p>

                  <div class="mb-6 pb-6 border-b border-stone-100 dark:border-slate-700">
                    <div class="flex items-baseline gap-1">
                      <span class="text-6xl font-black bg-gradient-to-br from-stone-900 to-stone-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{{ plan.priceXof }}</span>
                      <span class="text-lg font-bold text-stone-500">FCFA</span>
                    </div>
                    <p class="text-sm text-stone-500 dark:text-slate-400 mt-1">
                      @if (plan.durationDays < 9999) {
                        par mois, sans engagement
                      } @else {
                        à vie, gratuit
                      }
                    </p>
                  </div>

                  <ul class="space-y-3 text-sm flex-1">
                    <li class="flex items-start gap-3">
                      <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <lucide-icon [img]="icons.Check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400"></lucide-icon>
                      </div>
                      <span class="text-stone-700 dark:text-slate-300">
                        <strong class="text-stone-900 dark:text-white">{{ plan.maxProperties ?? '∞' }}</strong>
                        annonce{{ (plan.maxProperties ?? 0) > 1 ? 's' : '' }} maximum
                      </span>
                    </li>
                    <li class="flex items-start gap-3">
                      <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <lucide-icon [img]="icons.Check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400"></lucide-icon>
                      </div>
                      <span class="text-stone-700 dark:text-slate-300">
                        <strong class="text-stone-900 dark:text-white">{{ plan.maxScenes ?? '∞' }}</strong>
                        scène{{ (plan.maxScenes ?? 0) > 1 ? 's' : '' }} 3D
                      </span>
                    </li>
                    <li class="flex items-start gap-3">
                      <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <lucide-icon [img]="icons.Check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400"></lucide-icon>
                      </div>
                      <span class="text-stone-700 dark:text-slate-300">Visite virtuelle multi-scènes</span>
                    </li>
                    @if (plan.code === 'PRO') {
                      <li class="flex items-start gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <lucide-icon [img]="icons.Shield" class="w-3 h-3 text-emerald-600 dark:text-emerald-400"></lucide-icon>
                        </div>
                        <span class="text-stone-700 dark:text-slate-300">Support prioritaire</span>
                      </li>
                      <li class="flex items-start gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <lucide-icon [img]="icons.TrendingUp" class="w-3 h-3 text-emerald-600 dark:text-emerald-400"></lucide-icon>
                        </div>
                        <span class="text-stone-700 dark:text-slate-300">Statistiques avancées</span>
                      </li>
                    }
                  </ul>
                </div>

                <div class="p-5 bg-stone-50 dark:bg-slate-900 border-t border-stone-100 dark:border-slate-700">
                  @if (isCurrentPlan(plan)) {
                    <button disabled class="w-full bg-stone-200 dark:bg-slate-700 text-stone-500 dark:text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                      <lucide-icon [img]="icons.Check" class="w-5 h-5"></lucide-icon>
                      Votre plan actuel
                    </button>
                  } @else if (plan.priceXof === 0) {
                    <button (click)="askSelect(plan)"
                            [disabled]="subscribing()"
                            class="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                      <lucide-icon [img]="icons.Zap" class="w-5 h-5"></lucide-icon>
                      {{ subscribing() ? 'Activation…' : 'Activer gratuitement' }}
                    </button>
                  } @else {
                    @if (plan.code === 'STD') {
                    <button (click)="askSelect(plan)"
                            [disabled]="subscribing()"
                            class="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                      <lucide-icon [img]="icons.CreditCard" class="w-5 h-5"></lucide-icon>
                      {{ subscribing() ? 'Traitement…' : 'Souscrire — ' + plan.priceXof + ' F' }}
                    </button>
                  } @else if (plan.code === 'PRO') {
                    <button (click)="askSelect(plan)"
                            [disabled]="subscribing()"
                            class="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      <lucide-icon [img]="icons.CreditCard" class="w-5 h-5"></lucide-icon>
                      {{ subscribing() ? 'Traitement…' : 'Souscrire — ' + plan.priceXof + ' F' }}
                    </button>
                  } @else {
                    <button (click)="askSelect(plan)"
                            [disabled]="subscribing()"
                            class="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black">
                      <lucide-icon [img]="icons.Zap" class="w-5 h-5"></lucide-icon>
                      {{ subscribing() ? 'Traitement…' : 'Activer gratuitement' }}
                    </button>
                  }
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Historique -->
        @if (subscriptionHistory().length > 0) {
          <div class="mt-16">
            <h2 class="text-3xl font-black text-stone-900 dark:text-white mb-6 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center">
                <lucide-icon [img]="icons.History" class="w-5 h-5 text-white"></lucide-icon>
              </div>
              Historique de mes abonnements
            </h2>

            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-stone-100 dark:border-slate-700 overflow-hidden">
              <div class="relative">
                <div class="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400 via-purple-400 to-transparent"></div>

                @for (h of subscriptionHistory(); track h.id; let i = $index) {
                  <div class="relative pl-20 pr-6 py-6"
                       [class.border-b]="i < subscriptionHistory().length - 1"
                       [class.border-stone-100]="i < subscriptionHistory().length - 1"
                       [class.dark:border-slate-700]="i < subscriptionHistory().length - 1">
                    <div class="absolute left-5 top-7 w-6 h-6 rounded-full flex items-center justify-center"
                         [class.bg-emerald-500]="h.status === 'ACTIVE'"
                         [class.bg-slate-400]="h.status === 'EXPIRED'"
                         [class.bg-red-400]="h.status === 'CANCELLED'"
                         [class.ring-4]="h.status === 'ACTIVE'"
                         [class.ring-emerald-100]="h.status === 'ACTIVE'">
                      <lucide-icon [img]="icons.Check" class="w-3.5 h-3.5 text-white"></lucide-icon>
                    </div>

                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-bold text-stone-900 dark:text-white">{{ h.planName }}</span>
                          <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                                [class.bg-emerald-100]="h.status === 'ACTIVE'"
                                [class.text-emerald-700]="h.status === 'ACTIVE'"
                                [class.bg-slate-100]="h.status === 'EXPIRED'"
                                [class.text-slate-600]="h.status === 'EXPIRED'"
                                [class.bg-red-100]="h.status === 'CANCELLED'"
                                [class.text-red-700]="h.status === 'CANCELLED'">
                            {{ h.status }}
                          </span>
                        </div>
                        <p class="text-sm text-stone-500 dark:text-slate-400">
                          Du {{ h.startDate | date:'dd/MM/yyyy' }}
                          @if (h.endDate) { au {{ h.endDate | date:'dd/MM/yyyy' }} }
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <div class="mt-16 text-center">
          <div class="inline-flex items-center gap-2 text-stone-400 dark:text-slate-500 text-sm">
            <lucide-icon [img]="icons.Quote" class="w-4 h-4"></lucide-icon>
            <span>Paiement sécurisé via Jeko • Sans engagement • Support 7j/7</span>
          </div>
        </div>

      </main>

      <!-- MODAL CONFIRMATION -->
      <app-confirm-modal
        [isOpen]="confirmOpen()"
        [title]="confirmTitle()"
        [message]="confirmMessage()"
        [confirmLabel]="confirmActionLabel()"
        cancelLabel="Annuler"
        (confirmed)="onConfirm()"
        (cancelled)="onCancel()" />
    </div>
  `
})
export class SubscriptionPageComponent implements OnInit {

  plans = signal<Plan[]>([]);
  currentSubscription = signal<Subscription | null>(null);
  subscriptionHistory = signal<Subscription[]>([]);
  payments = signal<any[]>([]);
  loading = signal(true);
  subscribing = signal(false);
  cancelling = signal(false);

  // Modal state
  confirmOpen = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmActionLabel = signal('Confirmer');
  pendingAction = signal<(() => void) | null>(null);

  icons = {
    Check, Crown, Sparkles, Zap, Calendar, TrendingUp,
    CreditCard, ChevronRight, Star, Shield, ArrowLeft,
    XCircle, History, AlertCircle, PartyPopper, Quote
  };

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (data) => {
        this.plans.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur plans', err);
        this.loading.set(false);
      }
    });

    this.subscriptionService.getMySubscription().subscribe({
      next: (sub: any) => {
        this.currentSubscription.set(sub && sub.id ? sub : null);
      },
      error: () => this.currentSubscription.set(null)
    });

    this.subscriptionService.getSubscriptionHistory().subscribe({
      next: (h) => this.subscriptionHistory.set(h),
      error: (err) => console.error('Erreur history', err)
    });
  }

  isCurrentPlan(plan: Plan): boolean {
    return this.currentSubscription()?.planCode === plan.code;
  }

  daysLeft(): number {
    const sub = this.currentSubscription();
    if (!sub || !sub.endDate) return 0;
    const diff = new Date(sub.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  askSelect(plan: Plan): void {
    const priceLabel = plan.priceXof === 0 ? '0 FCFA' : `${plan.priceXof} FCFA`;
    this.confirmTitle.set(`Souscrire au plan ${plan.name}`);
    this.confirmMessage.set(
      plan.priceXof === 0
        ? `Activer le plan ${plan.name} gratuitement ?`
        : `Vous allez être redirigé vers Jeko pour payer ${priceLabel}. Votre abonnement sera activé dès confirmation du paiement.`
    );
    this.confirmActionLabel.set(plan.priceXof === 0 ? 'Activer' : 'Continuer');
    this.pendingAction.set(() => this.executeSelect(plan));
    this.confirmOpen.set(true);
  }

  askCancel(): void {
    this.confirmTitle.set('Annuler votre abonnement ?');
    this.confirmMessage.set('Votre abonnement restera actif jusqu\'à sa date d\'expiration. Vous ne serez pas remboursé pour le mois en cours.');
    this.confirmActionLabel.set('Confirmer l\'annulation');
    this.pendingAction.set(() => this.executeCancel());
    this.confirmOpen.set(true);
  }

  onConfirm(): void {
    const action = this.pendingAction();
    this.confirmOpen.set(false);
    if (action) action();
    this.pendingAction.set(null);
  }

  onCancel(): void {
    this.confirmOpen.set(false);
    this.pendingAction.set(null);
  }

  private executeSelect(plan: Plan): void {
    this.subscribing.set(true);
    this.subscriptionService.initiatePayment(plan.code).subscribe({
      next: (response) => {
        this.subscribing.set(false);
        if (response.mode === 'free-activation') {
          this.router.navigate(['/owner/subscription/success']);
        } else if (response.redirectUrl) {
          if (response.redirectUrl.startsWith('http')) {
            window.location.href = response.redirectUrl;
          } else {
            this.router.navigate([response.redirectUrl]);
          }
        }
      },
      error: (err) => {
        this.subscribing.set(false);
        console.error(err);
      }
    });
  }

  private executeCancel(): void {
    this.cancelling.set(true);
    this.subscriptionService.cancelSubscription().subscribe({
      next: () => {
        this.cancelling.set(false);
        this.loadAll();
      },
      error: (err) => {
        this.cancelling.set(false);
        console.error(err);
      }
    });
  }
}