import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tokenize', pathMatch: 'full' },
  {
    path: 'tokenize',
    loadComponent: () => import('./pages/tokenize/tokenize.component').then(m => m.TokenizeComponent)
  }
];
