import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'parties',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'parties',
    loadChildren: () => import('./parties/parties.routes').then(m => m.PARTIES_ROUTES)
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadChildren: () => import('./tickets/tickets.routes').then(m => m.TICKETS_ROUTES)
  },
  {
    path: 'receipts',
    canActivate: [authGuard],
    loadChildren: () => import('./receipts/receipts.routes').then(m => m.RECEIPTS_ROUTES)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./profile/profile.routes').then(m => m.PROFILE_ROUTES)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound)
  }
];