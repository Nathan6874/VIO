import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white transition-colors">
      <app-navbar />
      <router-outlet />
    </div>
  `
})
export class App {
  theme = inject(ThemeService);
}