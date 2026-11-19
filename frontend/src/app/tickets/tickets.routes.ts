
import { Routes } from '@angular/router';

export const TICKETS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'my-tickets',
    pathMatch: 'full',
  },
  {
    path: 'my-tickets',
    loadComponent: () => import('./my-tickets/my-tickets').then((m) => m.MyTickets),
  },
  {
    path: 'my-tickets/:id',
    loadComponent: () => import('./party-tickets/party-tickets').then((m) => m.PartyTickets),
  },
  {
    path: 'checkout/:id',
    loadComponent: () => import('./checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: '**',
    redirectTo: 'my-tickets',
  },
];

export default TICKETS_ROUTES;