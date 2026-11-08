import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePropertyRequest, Property } from '../models/property.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private readonly apiUrl = `${environment.apiUrl}/api/properties`;

  constructor(private http: HttpClient) {
  }

  getPublicProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/public`);
  }

  getPublicProperty(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/public/${id}`);
  }

  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl);
  }

  createProperty(data: CreatePropertyRequest): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, data);
  }
}