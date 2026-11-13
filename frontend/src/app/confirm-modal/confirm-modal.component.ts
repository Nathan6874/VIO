import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, X } from 'lucide-angular';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
           (click)="onCancel()">
        <div class="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
             (click)="$event.stopPropagation()">
          <!-- Close -->
          <button (click)="onCancel()"
                  class="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors">
            <lucide-icon [img]="icons.X" class="w-4 h-4 text-stone-500"></lucide-icon>
          </button>

          <!-- Icon -->
          <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
            <lucide-icon [img]="icons.AlertCircle" class="w-7 h-7 text-blue-600 dark:text-blue-400"></lucide-icon>
          </div>

          <!-- Titre -->
          <h3 class="text-xl font-bold text-center text-stone-900 dark:text-white mb-2">
            {{ title }}
          </h3>

          <!-- Message -->
          <p class="text-center text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            {{ message }}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button (click)="onCancel()"
                    class="flex-1 btn-secondary">
              {{ cancelLabel }}
            </button>
            <button (click)="onConfirm()"
                    class="flex-1 btn-primary">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmer';
  @Input() message = 'Êtes-vous sûr ?';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  icons = { AlertCircle, X };

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}