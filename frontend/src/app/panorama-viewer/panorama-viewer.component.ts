import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var pannellum: any;

@Component({
  selector: 'app-panorama-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #viewerContainer class="panorama-container"></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .panorama-container {
      width: 100%;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
      background: #000;
    }
  `]
})
export class PanoramaViewerComponent implements OnInit, OnDestroy {

  @Input() imageUrl!: string;
  @Input() title: string = 'Panorama 360°';

  @ViewChild('viewerContainer', { static: true }) viewerContainer!: ElementRef;

  private viewer: any;

  ngOnInit(): void {
    // Pannellum est chargé globalement via angular.json (scripts)
    if (typeof pannellum !== 'undefined') {
      this.initViewer();
    } else {
      console.error('Pannellum is not loaded');
    }
  }

  ngOnDestroy(): void {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  private initViewer(): void {
    this.viewer = pannellum.viewer(this.viewerContainer.nativeElement, {
      type: 'equirectangular',
      panorama: this.imageUrl,
      autoLoad: true,
      autoRotate: -2,
      compass: false,
      showControls: true,
      showFullscreenCtrl: true,
      showZoomCtrl: true,
      previewTitle: this.title,
    });
  }
}