import { Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: PropertyListComponent },
  { path: 'properties/:id', component: PropertyDetailComponent },
  {path: 'login', component: LoginComponent}
];