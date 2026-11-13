import { Component, Input, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
           (click)="close()">
        <!-- Close -->
        <button (click)="close(); $event.stopPropagation()"
                class="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10">
          <lucide-icon [img]="icons.X" class="w-6 h-6"></lucide-icon>
        </button>

        <!-- Prev -->
        @if (images.length > 1) {
          <button (click)="prev(); $event.stopPropagation()"
                  class="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10">
            <lucide-icon [img]="icons.ChevronLeft" class="w-6 h-6"></lucide-icon>
          </button>
        }

        <!-- Image -->
        <img [src]="images[currentIndex()]"
             (click)="$event.stopPropagation()"
             class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" />

        <!-- Next -->
        @if (images.length > 1) {
          <button (click)="next(); $event.stopPropagation()"
                  class="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10">
            <lucide-icon [img]="icons.ChevronRight" class="w-6 h-6"></lucide-icon>
          </button>
        }

        <!-- Compteur -->
        @if (images.length > 1) {
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
            {{ currentIndex() + 1 }} / {{ images.length }}
          </div>
        }
      </div>
    }
  `
})
export class ImageLightboxComponent {
  @Input() set imageList(value: string[]) {
    this.images = value;
  }
  @Input() set openIndex(value: number | null) {
    if (value !== null) {
      this.currentIndex.set(value);
      this.isOpen.set(true);
    } else {
      this.isOpen.set(false);
    }
  }

  images: string[] = [];
  isOpen = signal(false);
  currentIndex = signal(0);

  icons = { X, ChevronLeft, ChevronRight };

  close(): void {
    this.isOpen.set(false);
  }

  prev(): void {
    this.currentIndex.update(i => (i - 1 + this.images.length) % this.images.length);
  }

  next(): void {
    this.currentIndex.update(i => (i + 1) % this.images.length);
  }

  @HostListener('document:keydown', ['$event'])
  handleKey(event: KeyboardEvent): void {
    if (!this.isOpen()) return;
    if (event.key === 'Escape') this.close();
    if (event.key === 'ArrowLeft') this.prev();
    if (event.key === 'ArrowRight') this.next();
  }
}