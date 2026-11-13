import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard, Home, Users, AlertTriangle, FileText,
  Search, Bell, Check, X, Pause, Ban, Play, ChevronRight,
  ArrowRight, Building2, UserCheck, Clock, TrendingUp, Wallet
} from 'lucide-angular';
import {
  AdminReport, AdminService, AdminStats, AdminUser, AuditLog
} from '../services/admin.service';
import { Property } from '../models/property.model';
import { AuthService } from '../services/auth.service';

type Section = 'overview' | 'properties' | 'users' | 'reports' | 'audit';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950 flex">

      <!-- SIDEBAR -->
      <aside class="w-64 bg-stone-900 dark:bg-black text-white flex flex-col flex-shrink-0">
        <div class="h-16 flex items-center px-6 border-b border-stone-800">
          <span class="text-2xl font-bold text-white">VIO</span>
          <span class="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded font-semibold">ADMIN</span>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          <button (click)="section.set('overview')"
                  [class.bg-stone-800]="section() === 'overview'"
                  [class.text-white]="section() === 'overview'"
                  [class.text-stone-400]="section() !== 'overview'"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800 transition text-sm font-medium text-left">
            <lucide-icon [img]="icons.LayoutDashboard" class="w-5 h-5"></lucide-icon>
            <span>Vue d'ensemble</span>
          </button>
          <button (click)="section.set('properties')"
                  [class.bg-stone-800]="section() === 'properties'"
                  [class.text-white]="section() === 'properties'"
                  [class.text-stone-400]="section() !== 'properties'"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800 transition text-sm font-medium text-left">
            <lucide-icon [img]="icons.Home" class="w-5 h-5"></lucide-icon>
            <span>Annonces</span>
            @if (stats() && stats()!.pendingProperties > 0) {
              <span class="ml-auto bg-amber-500 text-stone-900 text-xs px-2 py-0.5 rounded-full font-bold">{{ stats()!.pendingProperties }}</span>
            }
          </button>
          <button (click)="section.set('users')"
                  [class.bg-stone-800]="section() === 'users'"
                  [class.text-white]="section() === 'users'"
                  [class.text-stone-400]="section() !== 'users'"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800 transition text-sm font-medium text-left">
            <lucide-icon [img]="icons.Users" class="w-5 h-5"></lucide-icon>
            <span>Utilisateurs</span>
            @if (stats()) {
              <span class="ml-auto text-stone-500 text-xs">{{ stats()!.totalUsers }}</span>
            }
          </button>
          <button (click)="section.set('reports')"
                  [class.bg-stone-800]="section() === 'reports'"
                  [class.text-white]="section() === 'reports'"
                  [class.text-stone-400]="section() !== 'reports'"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800 transition text-sm font-medium text-left">
            <lucide-icon [img]="icons.AlertTriangle" class="w-5 h-5"></lucide-icon>
            <span>Signalements</span>
            @if (stats() && stats()!.openReports > 0) {
              <span class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{{ stats()!.openReports }}</span>
            }
          </button>
          <button (click)="section.set('audit')"
                  [class.bg-stone-800]="section() === 'audit'"
                  [class.text-white]="section() === 'audit'"
                  [class.text-stone-400]="section() !== 'audit'"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800 transition text-sm font-medium text-left">
            <lucide-icon [img]="icons.FileText" class="w-5 h-5"></lucide-icon>
            <span>Journal d'audit</span>
          </button>
        </nav>

        <div class="p-4 border-t border-stone-800">
          <a routerLink="/" class="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition">
            <lucide-icon [img]="icons.ArrowRight" class="w-4 h-4 rotate-180"></lucide-icon>
            Retour au site
          </a>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="flex-1 flex flex-col min-w-0">

        <header class="h-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center px-6 flex-shrink-0">
          <h1 class="text-xl font-bold text-stone-900 dark:text-white">
            @switch (section()) {
              @case ('overview') { Vue d'ensemble }
              @case ('properties') { Gestion des annonces }
              @case ('users') { Gestion des utilisateurs }
              @case ('reports') { Signalements }
              @case ('audit') { Journal d'audit }
            }
          </h1>

          <div class="ml-auto flex items-center gap-4">
            @if (stats() && stats()!.pendingProperties > 0) {
              <button (click)="section.set('properties')"
                      class="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-sm px-3 py-1.5 rounded-md transition">
                <lucide-icon [img]="icons.Bell" class="w-4 h-4"></lucide-icon>
                <span>{{ stats()!.pendingProperties }} en attente</span>
              </button>
            }
            <div class="flex items-center gap-3 pl-3 border-l border-stone-200 dark:border-stone-700">
              <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {{ authService.getInitiales() }}
              </div>
              <div class="hidden sm:block">
                <p class="font-semibold text-stone-900 dark:text-white text-sm leading-tight">
                  {{ authService.getPrenom() }}
                </p>
                <p class="text-xs text-stone-500 dark:text-stone-400 leading-tight flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Administrateur
                </p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-auto p-6">

          <!-- VUE D'ENSEMBLE -->
          @if (section() === 'overview') {
            @if (stats()) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="vio-card">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                      <lucide-icon [img]="icons.Users" class="w-6 h-6 text-blue-600 dark:text-blue-400"></lucide-icon>
                    </div>
                    <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">Total</span>
                  </div>
                  <p class="text-3xl font-bold text-stone-900 dark:text-white">{{ stats()!.totalUsers }}</p>
                  <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">Utilisateurs inscrits</p>
                  <div class="mt-3 flex gap-3 text-xs">
                    <span class="text-blue-600 dark:text-blue-400">{{ stats()!.totalOwners }} proprio</span>
                    <span class="text-pink-600 dark:text-pink-400">{{ stats()!.totalClients }} client</span>
                  </div>
                </div>

                <div class="vio-card">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
                      <lucide-icon [img]="icons.Home" class="w-6 h-6 text-green-600 dark:text-green-400"></lucide-icon>
                    </div>
                    @if (stats()!.pendingProperties > 0) {
                      <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded">{{ stats()!.pendingProperties }} à valider</span>
                    }
                  </div>
                  <p class="text-3xl font-bold text-stone-900 dark:text-white">{{ stats()!.totalProperties }}</p>
                  <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">Annonces publiées</p>
                  <div class="mt-3 flex gap-3 text-xs">
                    <span class="text-green-600 dark:text-green-400">{{ stats()!.approvedProperties }} approuvées</span>
                    <span class="text-red-600 dark:text-red-400">{{ stats()!.rejectedProperties }} rejetées</span>
                  </div>
                </div>

                <div class="vio-card">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
                      <lucide-icon [img]="icons.AlertTriangle" class="w-6 h-6 text-red-600 dark:text-red-400"></lucide-icon>
                    </div>
                    @if (stats()!.openReports > 0) {
                      <span class="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-1 rounded animate-pulse">À traiter</span>
                    }
                  </div>
                  <p class="text-3xl font-bold text-stone-900 dark:text-white">{{ stats()!.openReports }}<span class="text-lg text-stone-400">/{{ stats()!.totalReports }}</span></p>
                  <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">Signalements ouverts</p>
                </div>

                <div class="vio-card">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center">
                      <lucide-icon [img]="icons.Wallet" class="w-6 h-6 text-purple-600 dark:text-purple-400"></lucide-icon>
                    </div>
                    <span class="text-xs font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">À venir</span>
                  </div>
                  <p class="text-3xl font-bold text-stone-400">—</p>
                  <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">Revenus abonnements</p>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="vio-card">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <lucide-icon [img]="icons.Clock" class="w-5 h-5 text-stone-500"></lucide-icon>
                      Annonces en attente
                    </h2>
                    <button (click)="section.set('properties')" class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Voir tout →
                    </button>
                  </div>
                  @if (pending().length === 0) {
                    <div class="flex flex-col items-center py-8 text-stone-400">
                      <lucide-icon [img]="icons.Check" class="w-8 h-8 mb-2 text-green-500"></lucide-icon>
                      <p class="text-sm">Aucune annonce à valider</p>
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (p of pending().slice(0, 3); track p.id) {
                        <div class="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                          <div class="flex-1 min-w-0">
                            <p class="font-medium text-sm text-stone-900 dark:text-white truncate">{{ p.titre }}</p>
                            <p class="text-xs text-stone-500 dark:text-stone-400">{{ p.commune }}, {{ p.ville }} — {{ p.prix }} FCFA</p>
                          </div>
                          <div class="flex gap-1 ml-2">
                            <button (click)="approve(p.id)" class="text-xs bg-green-600 hover:bg-green-700 text-white p-1.5 rounded transition">
                              <lucide-icon [img]="icons.Check" class="w-3.5 h-3.5"></lucide-icon>
                            </button>
                            <button (click)="reject(p.id)" class="text-xs bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition">
                              <lucide-icon [img]="icons.X" class="w-3.5 h-3.5"></lucide-icon>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <div class="vio-card">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <lucide-icon [img]="icons.TrendingUp" class="w-5 h-5 text-stone-500"></lucide-icon>
                      Dernières actions
                    </h2>
                    <button (click)="section.set('audit')" class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Voir tout →
                    </button>
                  </div>
                  @if (auditLogs().length === 0) {
                    <div class="flex flex-col items-center py-8 text-stone-400">
                      <lucide-icon [img]="icons.FileText" class="w-8 h-8 mb-2"></lucide-icon>
                      <p class="text-sm">Aucune action enregistrée</p>
                    </div>
                  } @else {
                    <div class="space-y-2">
                      @for (log of auditLogs().slice(0, 5); track log.id) {
                        <div class="flex items-start gap-2 text-sm">
                          <span class="text-stone-400 text-xs mt-0.5 flex-shrink-0">{{ log.createdAt | date:'HH:mm' }}</span>
                          <span class="flex-1">
                            <span class="font-mono text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded">{{ log.action }}</span>
                            <span class="text-stone-500 dark:text-stone-400"> sur {{ log.targetType }} #{{ log.targetId }}</span>
                          </span>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          }

          <!-- ANNONCES -->
          @if (section() === 'properties') {
            <div class="mb-4 relative max-w-md">
              <lucide-icon [img]="icons.Search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher une annonce…"
                     class="input pl-10" />
            </div>

            @if (filteredPending().length === 0) {
              <div class="vio-card text-center py-16">
                <lucide-icon [img]="icons.Check" class="w-12 h-12 mx-auto mb-3 text-green-500"></lucide-icon>
                <p class="text-stone-700 dark:text-stone-300 font-medium">Aucune annonce en attente</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                @for (p of filteredPending(); track p.id) {
                  <div class="vio-card">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="font-bold text-stone-900 dark:text-white truncate">{{ p.titre }}</h3>
                      <span class="badge-warning flex-shrink-0 ml-2">PENDING</span>
                    </div>
                    <p class="text-sm text-stone-600 dark:text-stone-400 mb-3">{{ p.commune }}, {{ p.ville }}</p>
                    <p class="text-xl font-bold text-red-600 dark:text-red-400 mb-3">{{ p.prix.toLocaleString('fr-FR') }} FCFA</p>
                    <p class="text-sm text-stone-700 dark:text-stone-300 line-clamp-2 mb-3">{{ p.description }}</p>
                    <div class="border-t border-stone-100 dark:border-stone-800 pt-3 mt-3 flex gap-2">
                      <button (click)="approve(p.id)" class="flex-1 btn-primary bg-green-600 hover:bg-green-700">
                        ✓ Approuver
                      </button>
                      <button (click)="reject(p.id)" class="flex-1 btn-secondary text-red-600 dark:text-red-400">
                        ✗ Rejeter
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          }

          <!-- UTILISATEURS -->
          @if (section() === 'users') {
            <div class="mb-4 flex gap-3 flex-wrap items-center">
              <div class="relative flex-1 max-w-md">
                <lucide-icon [img]="icons.Search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
                <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher un utilisateur…"
                       class="input pl-10" />
              </div>
              <select [(ngModel)]="userRoleFilter" class="input max-w-xs">
                <option value="">Tous les rôles</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Propriétaire</option>
                <option value="CLIENT">Client</option>
              </select>
              <select [(ngModel)]="userStatusFilter" class="input max-w-xs">
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="BANNED">Banni</option>
              </select>
            </div>

            <div class="vio-card overflow-hidden p-0">
              <table class="w-full text-sm">
                <thead class="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Utilisateur</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">WhatsApp</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Rôle</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Statut</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Inscription</th>
                    <th class="text-right px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of filteredUsers(); track u.id) {
                    <tr class="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                               [class.bg-purple-600]="u.role === 'ADMIN'"
                               [class.bg-blue-600]="u.role === 'OWNER'"
                               [class.bg-pink-600]="u.role === 'CLIENT'">
                            {{ u.prenom.charAt(0) }}{{ u.nom.charAt(0) }}
                          </div>
                          <p class="font-medium text-stone-900 dark:text-white">{{ u.prenom }} {{ u.nom }}</p>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-stone-700 dark:text-stone-300">{{ u.whatsapp }}</td>
                      <td class="px-4 py-3">
                        <span class="badge-info">{{ u.role }}</span>
                      </td>
                      <td class="px-4 py-3">
                        <span class="badge"
                              [class.badge-success]="u.accountStatus === 'ACTIVE'"
                              [class.badge-warning]="u.accountStatus === 'SUSPENDED'"
                              [class.badge-danger]="u.accountStatus === 'BANNED'">
                          {{ u.accountStatus }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-xs text-stone-500 dark:text-stone-400">{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="px-4 py-3 text-right">
                        @if (u.role !== 'ADMIN') {
                          <div class="flex gap-1 justify-end">
                            @if (u.accountStatus === 'ACTIVE') {
                              <button (click)="suspendUser(u.id)" title="Suspendre"
                                      class="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 rounded transition">
                                <lucide-icon [img]="icons.Pause" class="w-4 h-4"></lucide-icon>
                              </button>
                              <button (click)="banUser(u.id)" title="Bannir"
                                      class="p-1.5 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 rounded transition">
                                <lucide-icon [img]="icons.Ban" class="w-4 h-4"></lucide-icon>
                              </button>
                            } @else {
                              <button (click)="reactivateUser(u.id)" title="Réactiver"
                                      class="p-1.5 bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900 rounded transition">
                                <lucide-icon [img]="icons.Play" class="w-4 h-4"></lucide-icon>
                              </button>
                            }
                          </div>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- SIGNALEMENTS -->
          @if (section() === 'reports') {
            @if (reports().length === 0) {
              <div class="vio-card text-center py-16">
                <lucide-icon [img]="icons.Check" class="w-12 h-12 mx-auto mb-3 text-green-500"></lucide-icon>
                <p class="text-stone-700 dark:text-stone-300 font-medium">Aucun signalement</p>
                <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">La plateforme est saine</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (r of reports(); track r.id) {
                  <div class="vio-card border-l-4"
                       [class.border-amber-500]="r.status === 'OPEN'"
                       [class.border-green-500]="r.status === 'RESOLVED'"
                       [class.border-stone-400]="r.status === 'DISMISSED'">
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-mono text-xs bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-700 dark:text-stone-300">#{{ r.id }}</span>
                          <span class="font-semibold text-stone-900 dark:text-white">{{ r.reason }}</span>
                        </div>
                        <p class="text-sm text-stone-700 dark:text-stone-300">Annonce : <strong>{{ r.propertyTitre }}</strong></p>
                        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">Par {{ r.reporterWhatsapp }} — {{ r.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                    </div>
                    @if (r.description) {
                      <p class="text-sm text-stone-700 dark:text-stone-300 mb-3 italic bg-stone-50 dark:bg-stone-800 p-3 rounded">"{{ r.description }}"</p>
                    }
                    @if (r.status === 'OPEN') {
                      <div class="flex gap-2 mt-3">
                        <input type="text" [(ngModel)]="resolutionText" placeholder="Résolution…" class="input flex-1" />
                        <button (click)="resolveReport(r.id)" class="btn-primary bg-green-600 hover:bg-green-700">Résoudre</button>
                        <button (click)="dismissReport(r.id)" class="btn-secondary">Classer</button>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }

          <!-- AUDIT -->
          @if (section() === 'audit') {
            <div class="mb-4 relative max-w-md">
              <lucide-icon [img]="icons.Search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"></lucide-icon>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher une action…" class="input pl-10" />
            </div>

            <div class="vio-card overflow-hidden p-0">
              <table class="w-full text-sm">
                <thead class="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Date</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Admin</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Action</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Cible</th>
                    <th class="text-left px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  @for (log of filteredAuditLogs(); track log.id) {
                    <tr class="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td class="px-4 py-3 text-xs text-stone-500 dark:text-stone-400">{{ log.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="px-4 py-3 text-stone-700 dark:text-stone-300">{{ log.adminWhatsapp }}</td>
                      <td class="px-4 py-3">
                        <span class="font-mono text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-1 rounded">{{ log.action }}</span>
                      </td>
                      <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ log.targetType }} #{{ log.targetId }}</td>
                      <td class="px-4 py-3 text-xs text-stone-500 dark:text-stone-400">{{ log.metadata || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

        </main>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {

  section = signal<Section>('overview');
  stats = signal<AdminStats | null>(null);
  pending = signal<Property[]>([]);
  users = signal<AdminUser[]>([]);
  reports = signal<AdminReport[]>([]);
  auditLogs = signal<AuditLog[]>([]);

  searchQuery = '';
  userRoleFilter = '';
  userStatusFilter = '';
  resolutionText = '';

  icons = {
    LayoutDashboard, Home, Users, AlertTriangle, FileText,
    Search, Bell, Check, X, Pause, Ban, Play, ChevronRight,
    ArrowRight, Building2, UserCheck, Clock, TrendingUp, Wallet
  };

  filteredPending = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.pending();
    return this.pending().filter(p =>
      p.titre.toLowerCase().includes(q) ||
      p.commune.toLowerCase().includes(q) ||
      p.ville.toLowerCase().includes(q)
    );
  });

  filteredUsers = computed(() => {
    let list = this.users();
    const q = this.searchQuery.toLowerCase().trim();
    if (q) list = list.filter(u =>
      u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.whatsapp.includes(q));
    if (this.userRoleFilter) list = list.filter(u => u.role === this.userRoleFilter);
    if (this.userStatusFilter) list = list.filter(u => u.accountStatus === this.userStatusFilter);
    return list;
  });

  filteredAuditLogs = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.auditLogs();
    return this.auditLogs().filter(l =>
      l.action.toLowerCase().includes(q) || l.adminWhatsapp.includes(q));
  });

  constructor(private adminService: AdminService, public authService: AuthService) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.adminService.getStats().subscribe(s => this.stats.set(s));
    this.adminService.getPendingProperties().subscribe(p => this.pending.set(p));
    this.adminService.getUsers().subscribe(u => this.users.set(u));
    this.adminService.getReports().subscribe(r => this.reports.set(r));
    this.adminService.getAuditLogs().subscribe(a => this.auditLogs.set(a));
  }

  approve(id: number): void { this.adminService.approve(id).subscribe(() => this.refreshAll()); }
  reject(id: number): void { this.adminService.reject(id).subscribe(() => this.refreshAll()); }
  suspendUser(id: number): void {
    const reason = prompt('Raison de la suspension :');
    if (reason) this.adminService.suspendUser(id, reason).subscribe(() => this.refreshAll());
  }
  banUser(id: number): void {
    const reason = prompt('Raison du bannissement :');
    if (reason) this.adminService.banUser(id, reason).subscribe(() => this.refreshAll());
  }
  reactivateUser(id: number): void { this.adminService.reactivateUser(id).subscribe(() => this.refreshAll()); }
  resolveReport(id: number): void {
    if (!this.resolutionText.trim()) return;
    this.adminService.resolveReport(id, this.resolutionText).subscribe(() => {
      this.resolutionText = ''; this.refreshAll();
    });
  }
  dismissReport(id: number): void { this.adminService.dismissReport(id).subscribe(() => this.refreshAll()); }
}