import { Component, Input, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Media, MediaService } from '../services/media.service';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-container">
      <h3>Ajouter un média</h3>

      <label>
        Type
        <select [(ngModel)]="type">
          <option value="PHOTO">Photo</option>
          <option value="PANORAMA_360">Panorama 360°</option>
        </select>
      </label>

      <label>
        Fichier
        <input type="file" (change)="onFileSelected($event)" />
      </label>

      @if (uploading()) {
        <p>Upload en cours…</p>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (mediaList().length > 0) {
        <h4>Médias existants</h4>
        <div class="media-list">
          @for (m of mediaList(); track m.id) {
            <div class="media-item">
              @if (m.type === 'PHOTO') {
                <img [src]="'http://localhost:8087' + m.url" alt="Photo" />
              } @else {
                <p>{{ m.type }} : <a [href]="'http://localhost:8087' + m.url" target="_blank">{{ m.url }}</a></p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-container { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; margin: 1rem 0; }
    label { display: block; margin: 0.5rem 0; }
    select, input { margin-left: 0.5rem; }
    .error { color: red; }
    .media-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
    .media-item img { max-width: 150px; border-radius: 4px; }
  `]
})
export class MediaUploadComponent implements OnInit {

  @Input() propertyId!: number;
  @Output() mediaUploaded = new EventEmitter<Media>();

  type = 'PHOTO';
  uploading = signal(false);
  error = signal<string | null>(null);
  mediaList = signal<Media[]>([]);

  constructor(private mediaService: MediaService) {
  }

  ngOnInit(): void {
    this.mediaService.getMedia(this.propertyId).subscribe({
      next: (data) => this.mediaList.set(data),
      error: (err) => console.error(err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploading.set(true);
    this.error.set(null);

    this.mediaService.uploadMedia(this.propertyId, file, this.type).subscribe({
      next: (media) => {
        this.mediaList.update(list => [...list, media]);
        this.mediaUploaded.emit(media);
        this.uploading.set(false);
        input.value = '';
      },
      error: (err) => {
        this.error.set("Erreur lors de l'upload");
        this.uploading.set(false);
        console.error(err);
      }
    });
  }
}