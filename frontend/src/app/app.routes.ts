import { Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';

export const routes: Routes = [
  { path: '', component: PropertyListComponent },
  { path: 'properties/:id', component: PropertyDetailComponent }
];