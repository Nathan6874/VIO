import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../models/property.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly apiUrl = `${environment.apiUrl}/api/admin/properties`;

  constructor(private http: HttpClient) {
  }

  approve(id: number): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}/reject`, {});
  }

  getPendingProperties(): Observable<Property[]> {
  return this.http.get<Property[]>(this.apiUrl);
}
}