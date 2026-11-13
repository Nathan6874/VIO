import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PropertyStats {
  propertyId: number;
  propertyTitre: string;
  viewCount: number;
  lastViewed: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {
  }

  trackView(propertyId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/properties/${propertyId}/public/view`, {});
  }

  getViewCount(propertyId: number): Observable<{ viewCount: number }> {
    return this.http.get<{ viewCount: number }>(`${this.apiUrl}/properties/${propertyId}/public/views`);
  }

  getMyStats(): Observable<PropertyStats[]> {
    return this.http.get<PropertyStats[]>(`${this.apiUrl}/owner/stats`);
  }
}