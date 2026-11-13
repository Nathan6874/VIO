import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginRequest {
  whatsapp: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'vio_token';

  // Signal contenant le token (null si non connecté)
  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  constructor(private http: HttpClient) {
  }

  login(whatsapp: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { whatsapp, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.token.set(response.token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.token.set(null);
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  getRole(): string | null {
  const token = this.token();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (e) {
    return null;
  }
}

    getWhatsapp(): string | null {
        const token = this.token();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || null;
        } catch (e) {
            return null;
        }
    }

      getNom(): string | null {
    const token = this.token();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nom || null;
    } catch (e) {
      return null;
    }
  }

  getPrenom(): string | null {
    const token = this.token();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.prenom || null;
    } catch (e) {
      return null;
    }
  }

  getInitiales(): string {
    const prenom = this.getPrenom() || '';
    const nom = this.getNom() || '';
    const p = prenom.trim().charAt(0).toUpperCase();
    const n = nom.trim().charAt(0).toUpperCase();
    if (p || n) return p + n;
    const w = this.getWhatsapp() || 'A';
    return w.charAt(w.length - 2).toUpperCase() + w.charAt(w.length - 1);
  }
}