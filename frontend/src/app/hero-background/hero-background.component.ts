import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-bg">

      <!-- Grille isométrique de maisons -->
      <svg class="grid-svg" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="isometric-grid" x="0" y="0" width="280" height="240" patternUnits="userSpaceOnUse">
            <!-- Ligne isométrique montante -->
            <line x1="0"   y1="120" x2="140" y2="50"  stroke="currentColor" stroke-width="1"/>
            <line x1="140" y1="50"  x2="280" y2="120" stroke="currentColor" stroke-width="1"/>
            <!-- Ligne isométrique descendante -->
            <line x1="0"   y1="120" x2="140" y2="190" stroke="currentColor" stroke-width="1"/>
            <line x1="140" y1="190" x2="280" y2="120" stroke="currentColor" stroke-width="1"/>

            <!-- Maison isométrique (grande, détaillée) -->
            <g transform="translate(80, 60)">
              <!-- Corps de la maison -->
              <path d="M 0 60 L 60 30 L 120 60 L 120 140 L 60 170 L 0 140 Z"
                    stroke="currentColor" stroke-width="1.5" fill="none"/>
              <!-- Toit -->
              <path d="M -10 60 L 60 20 L 130 60"
                    stroke="currentColor" stroke-width="1.5" fill="none"/>
              <!-- Séparation intérieure -->
              <line x1="60" y1="30" x2="60" y2="140" stroke="currentColor" stroke-width="1"/>
              <!-- Fenêtre -->
              <rect x="75" y="80" width="20" height="20"
                    stroke="currentColor" stroke-width="1" fill="none" transform="skewY(-26.565)"/>
              <line x1="85" y1="80" x2="85" y2="100" stroke="currentColor" stroke-width="0.8"/>
              <line x1="75" y1="90" x2="95" y2="90" stroke="currentColor" stroke-width="0.8"/>
              <!-- Porte -->
              <rect x="30" y="100" width="20" height="30"
                    stroke="currentColor" stroke-width="1" fill="none" transform="skewY(-26.565)"/>
            </g>

            <!-- Petite maison -->
            <g transform="translate(180, 140)">
              <path d="M 0 40 L 40 20 L 80 40 L 80 90 L 40 110 L 0 90 Z"
                    stroke="currentColor" stroke-width="1.2" fill="none"/>
              <path d="M -5 40 L 40 15 L 85 40"
                    stroke="currentColor" stroke-width="1.2" fill="none"/>
              <line x1="40" y1="20" x2="40" y2="90" stroke="currentColor" stroke-width="0.8"/>
            </g>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#isometric-grid)"/>
      </svg>

      <!-- Overlay gradient subtil (moins opaque) -->
      <div class="hero-bg-overlay"></div>
    </div>
  `,
  styles: [`
    .hero-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
      color: #2563eb;
    }

    :host-context(.dark) .hero-bg {
      color: #60a5fa;
    }

    .grid-svg {
      position: absolute;
      inset: -20%;
      width: 140%;
      height: 140%;
      opacity: 0.25;
      animation: grid-drift 90s linear infinite;
    }

    :host-context(.dark) .grid-svg {
      opacity: 0.20;
    }

    @keyframes grid-drift {
      0%   { transform: translate(0, 0); }
      50%  { transform: translate(-140px, -60px); }
      100% { transform: translate(0, 0); }
    }

    /* Overlay ALLÉGÉ : 40% → 80% */
    .hero-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(250, 250, 249, 0.40) 0%,
        rgba(250, 250, 249, 0.70) 60%,
        rgba(250, 250, 249, 0.95) 100%
      );
    }

    :host-context(.dark) .hero-bg-overlay {
      background: linear-gradient(
        to bottom,
        rgba(12, 10, 9, 0.55) 0%,
        rgba(12, 10, 9, 0.80) 60%,
        rgba(12, 10, 9, 0.95) 100%
      );
    }

    @media (prefers-reduced-motion: reduce) {
      .grid-svg { animation: none; }
    }

    @media (max-width: 768px) {
      .grid-svg { animation: none; opacity: 0.15; }
      :host-context(.dark) .grid-svg { opacity: 0.10; }
    }
  `]
})
export class HeroBackgroundComponent {}