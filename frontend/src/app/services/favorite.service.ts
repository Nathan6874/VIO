import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Favorite {
  id: number;
  propertyId: number;
  propertyTitre: string;
  propertyVille: string;
  propertyCommune: string;
  propertyPrix: number;
  propertyType: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private readonly apiUrl = `${environment.apiUrl}/api/favorites`;

  constructor(private http: HttpClient) {
  }

  list(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(this.apiUrl);
  }

  add(propertyId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/${propertyId}`, {});
  }

  remove(propertyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${propertyId}`);
  }

  status(propertyId: number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/${propertyId}/status`);
  }
}