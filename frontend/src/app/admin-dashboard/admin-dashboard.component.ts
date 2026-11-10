import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../models/property.model';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 class="text-2xl font-bold text-gray-900">Administration — Annonces en attente</h1>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading()) {
          <p class="text-center text-gray-500 py-12">Chargement…</p>
        } @else if (error()) {
          <p class="text-center text-red-600 py-12">{{ error() }}</p>
        } @else if (pending().length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500">Aucune annonce en attente.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (p of pending(); track p.id) {
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-5">
                  <h2 class="text-lg font-bold text-gray-900 mb-2">{{ p.titre }}</h2>
                  <p class="text-sm font-semibold text-gray-600 mb-2">{{ p.commune }}, {{ p.ville }}</p>
                  <p class="text-xs text-gray-500 mb-3">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
                  <p class="text-xl font-bold text-red-600 mb-3">{{ p.prix }} FCFA</p>
                  <p class="text-sm text-gray-700 mb-3 line-clamp-2">{{ p.description }}</p>
                  <p class="text-xs text-gray-500 italic mb-4">Propriétaire : {{ p.owner.prenom }} {{ p.owner.nom }}</p>

                  <div class="flex gap-2">
                    <button
                      (click)="onApprove(p.id)"
                      class="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-md transition">
                      ✓ Approuver
                    </button>
                    <button
                      (click)="onReject(p.id)"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-md transition">
                      ✗ Rejeter
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {

  pending = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading.set(true);
    this.adminService.getPendingProperties().subscribe({
      next: (data) => {
        this.pending.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onApprove(id: number): void {
    this.adminService.approve(id).subscribe({
      next: () => this.loadPending(),
      error: (err) => console.error(err)
    });
  }

  onReject(id: number): void {
    this.adminService.reject(id).subscribe({
      next: () => this.loadPending(),
      error: (err) => console.error(err)
    });
  }
}