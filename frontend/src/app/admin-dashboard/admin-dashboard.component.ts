import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../models/property.model';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header">
      <h1>Administration — Annonces en attente</h1>
    </div>

    @if (loading()) {
      <p>Chargement…</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (pending().length === 0) {
      <p class="empty">Aucune annonce en attente.</p>
    } @else {
      <div class="grid">
        @for (p of pending(); track p.id) {
          <div class="card">
            <h2>{{ p.titre }}</h2>
            <p class="location">{{ p.commune }}, {{ p.ville }}</p>
            <p class="type">{{ p.type }} — {{ p.nombrePieces ?? '?' }} pièces — {{ p.surface ?? '?' }} m²</p>
            <p class="price">{{ p.prix }} FCFA</p>
            <p class="description">{{ p.description }}</p>
            <p class="owner">Propriétaire : {{ p.owner.prenom }} {{ p.owner.nom }}</p>

            <div class="actions">
              <button class="btn-approve" (click)="onApprove(p.id)">✓ Approuver</button>
              <button class="btn-reject" (click)="onReject(p.id)">✗ Rejeter</button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .header { padding: 1rem 2rem; }
    .header h1 { margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; padding: 1rem 2rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    .card h2 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .location { color: #666; font-weight: bold; margin: 0.3rem 0; }
    .type { color: #888; font-size: 0.9rem; margin: 0.3rem 0; }
    .price { font-size: 1.2rem; color: #e74c3c; font-weight: bold; margin: 0.5rem 0; }
    .description { color: #444; font-size: 0.9rem; }
    .owner { color: #555; font-style: italic; font-size: 0.85rem; }
    .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .actions button { flex: 1; padding: 0.5rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
    .btn-approve { background: #28a745; color: white; }
    .btn-approve:hover { background: #218838; }
    .btn-reject { background: #dc3545; color: white; }
    .btn-reject:hover { background: #c82333; }
    .empty { padding: 2rem; color: #666; }
    .error { color: red; padding: 1rem 2rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {

  pending = signal<Property[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private adminService: AdminService) {
  }

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