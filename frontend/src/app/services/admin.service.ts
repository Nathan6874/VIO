import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../models/property.model';
import { environment } from '../../environments/environment';

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalClients: number;
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  rejectedProperties: number;
  openReports: number;
  totalReports: number;
}

export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  whatsapp: string;
  role: string;
  accountStatus: string;
  createdAt: string;
}

export interface AdminReport {
  id: number;
  propertyId: number;
  propertyTitre: string;
  reporterId: number;
  reporterWhatsapp: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  resolution: string | null;
}

export interface AuditLog {
  id: number;
  adminId: number;
  adminWhatsapp: string;
  action: string;
  targetType: string;
  targetId: number | null;
  metadata: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {
  }

  // === Stats ===
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  // === Annonces ===
  getPendingProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`);
  }

  approve(id: number): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/properties/${id}/approve`, {});
  }

  reject(id: number): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/properties/${id}/reject`, {});
  }

  moderate(id: number, reason: string, newStatus: string): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/properties/${id}/moderate`,
      { reason, newStatus });
  }

  // === Users ===
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  suspendUser(id: number, reason: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${id}/suspend`, { reason });
  }

  banUser(id: number, reason: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${id}/ban`, { reason });
  }

  reactivateUser(id: number): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${id}/reactivate`, {});
  }

  // === Reports ===
  getReports(): Observable<AdminReport[]> {
    return this.http.get<AdminReport[]>(`${this.apiUrl}/reports`);
  }

  resolveReport(id: number, resolution: string): Observable<AdminReport> {
    return this.http.put<AdminReport>(`${this.apiUrl}/reports/${id}/resolve`, { resolution });
  }

  dismissReport(id: number): Observable<AdminReport> {
    return this.http.put<AdminReport>(`${this.apiUrl}/reports/${id}/dismiss`, {});
  }

  // === Audit ===
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/audit`);
  }
}