import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <h1>Connexion VIO</h1>

      <form (ngSubmit)="onSubmit()">
        <label>
          WhatsApp
          <input type="text" [(ngModel)]="whatsapp" name="whatsapp" required placeholder="+22501020304" />
        </label>

        <label>
          Mot de passe
          <input type="password" [(ngModel)]="password" name="password" required />
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <p class="back-link"><a routerLink="/">← Retour aux annonces</a></p>
    </div>
  `,
  styles: [`
    .login-container { max-width: 400px; margin: 2rem auto; padding: 2rem; }
    h1 { margin-bottom: 1.5rem; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    label { display: flex; flex-direction: column; font-weight: bold; }
    input { padding: 0.5rem; margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 0.7rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    button:hover:not(:disabled) { background: #0056b3; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .error { color: red; }
    .back-link { margin-top: 1rem; }
    .back-link a { color: #007bff; text-decoration: none; }
  `]
})
export class LoginComponent {

  whatsapp = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.whatsapp, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        // Rediriger vers la page d'accueil (ou dashboard plus tard)
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Identifiants invalides');
        console.error(err);
      }
    });
  }
}