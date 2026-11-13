import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Plan {
  id: number;
  code: string;
  name: string;
  priceXof: number;
  durationDays: number;
  maxProperties: number | null;
  maxScenes: number | null;
  description: string;
}

export interface Subscription {
  id: number;
  planCode: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

export interface InitiatePaymentResponse {
  paymentId: number | null;
  subscriptionId: number | null;
  redirectUrl: string | null;
  mode: string;
}

export interface PaymentHistory {
  id: number;
  planCode: string;
  amountXof: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {
  }

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/plans`);
  }

  getMySubscription(): Observable<Subscription | { active: false }> {
    return this.http.get<Subscription | { active: false }>(`${this.apiUrl}/subscriptions/me`);
  }

  initiatePayment(planCode: string): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(
      `${this.apiUrl}/payments/initiate`, { planCode });
  }

  mockConfirm(paymentId: number): Observable<{ status: string; paymentId: number; subscriptionId: number }> {
    return this.http.post<any>(
      `${this.apiUrl}/payments/mock-confirm/${paymentId}`, {});
  }

  getPaymentHistory(): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(`${this.apiUrl}/payments/history`);
  }

    /** Force un rechargement complet depuis le backend */
  refresh(): void {
    // No-op côté service, mais sémantique claire pour les composants
  }

    cancelSubscription(): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(
      `${this.apiUrl}/subscriptions/cancel`, {});
  }

  getSubscriptionHistory(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions/history`);
  }
}