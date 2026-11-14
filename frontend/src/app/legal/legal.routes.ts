import { Routes } from '@angular/router';

export const LEGAL_ROUTES: Routes = [
  {
    path: 'privacidad',
    loadComponent: () => import('./privacidad/privacy-page').then(m => m.PrivacyPage),
  },
  {
    path: 'terminos',
    loadComponent: () => import('./terminos/terms-page').then(m => m.TermsPage),
  },
];
