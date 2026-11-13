import { Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ClientFavoritesComponent } from './client-favorites/client-favorites.component';
import { authGuard } from './guards/auth.guard';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { PropertyCreateComponent } from './property-create/property-create.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { SubscriptionPageComponent } from './subscription/subscription-page.component';
import { SubscriptionMockPayComponent } from './subscription/subscription-mock-pay.component';
import { SubscriptionSuccessComponent } from './subscription/subscription-success.component';
import { ProfileComponent } from './profile/profile.component';
import { OwnerStatsComponent } from './owner-stats/owner-stats.component';

export const routes: Routes = [
  { path: '', component: PropertyListComponent },
  { path: 'properties/:id', component: PropertyDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'client/favorites', component: ClientFavoritesComponent, canActivate: [authGuard] },
  { path: 'owner/dashboard', component: OwnerDashboardComponent, canActivate: [authGuard] },
  { path: 'owner/properties/new', component: PropertyCreateComponent, canActivate: [authGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'owner/subscription', component: SubscriptionPageComponent, canActivate: [authGuard] },
  { path: 'owner/subscription/mock-pay/:paymentId', component: SubscriptionMockPayComponent, canActivate: [authGuard] },
  { path: 'owner/subscription/success', component: SubscriptionSuccessComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'owner/stats', component: OwnerStatsComponent, canActivate: [authGuard] },
];