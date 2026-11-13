import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-subscription-mock-pay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">

        @if (!confirmed()) {
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">💳</span>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-2">Paiement simulé</h1>
          <p class="text-gray-600 mb-6">
            Ceci est une page de test. En production, vous serez redirigé vers Jeko pour payer via Wave, Orange Money, etc.
          </p>

          @if (error()) {
            <p class="text-red-600 mb-4">{{ error() }}</p>
          }

          <button (click)="confirmPayment()"
                  [disabled]="loading()"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition">
            {{ loading() ? 'Activation…' : '✓ Confirmer le paiement (mock)' }}
          </button>

          <p class="text-xs text-gray-400 mt-4">
            Ou <a (click)="cancel()" class="text-gray-500 hover:underline cursor-pointer">annuler</a>
          </p>
        } @else {
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">✓</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
          <p class="text-gray-600 mb-6">Votre abonnement est activé.</p>
        }

      </div>
    </div>
  `
})
export class SubscriptionMockPayComponent implements OnInit {

  loading = signal(false);
  confirmed = signal(false);
  error = signal<string | null>(null);

  private paymentId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('paymentId'));
    if (!id) {
      this.error.set('ID de paiement invalide');
      return;
    }
    this.paymentId = id;
  }

  confirmPayment(): void {
    if (!this.paymentId) return;

    this.loading.set(true);
    this.error.set(null);

    this.subscriptionService.mockConfirm(this.paymentId).subscribe({
      next: () => {
        this.loading.set(false);
        this.confirmed.set(true);
        setTimeout(() => this.router.navigate(['/owner/subscription/success']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Erreur lors de la confirmation du paiement');
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/owner/subscription']);
  }
}