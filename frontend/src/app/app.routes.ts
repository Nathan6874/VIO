import { Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { PropertyCreateComponent } from './property-create/property-create.component';

export const routes: Routes = [
  { path: '', component: PropertyListComponent },
  { path: 'properties/:id', component: PropertyDetailComponent },
  {path: 'login', component: LoginComponent},
  { path: 'owner/dashboard', component: OwnerDashboardComponent, canActivate: [authGuard] },
  { path: 'owner/properties/new', component: PropertyCreateComponent, canActivate: [authGuard] }
];