import { Routes } from '@angular/router';

export const ACTIVITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./activity/activity').then((m) => m.Activity),
    pathMatch: 'full',
  },
  {
    path: 'seguidos',
    loadComponent: () => import('./following/following').then((m) => m.Following),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
