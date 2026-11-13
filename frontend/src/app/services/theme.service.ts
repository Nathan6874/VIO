import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  isDark = signal<boolean>(this.getInitialTheme());

  constructor() {
    // Applique le thème au démarrage et à chaque changement
    effect(() => {
      const dark = this.isDark();
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('vio-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('vio-theme', 'light');
      }
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private getInitialTheme(): boolean {
    const saved = localStorage.getItem('vio-theme');
    if (saved) return saved === 'dark';
    // Sinon, préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}