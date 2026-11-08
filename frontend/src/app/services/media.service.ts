import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Media {
  id: number;
  url: string;
  type: string;
  propertyId: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private readonly apiUrl = `${environment.apiUrl}/api/properties`;

  constructor(private http: HttpClient) {
  }

  uploadMedia(propertyId: number, file: File, type: string): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post<Media>(`${this.apiUrl}/${propertyId}/media/upload`, formData);
  }

  getMedia(propertyId: number): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.apiUrl}/${propertyId}/media`);
  }
}