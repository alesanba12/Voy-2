import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';
import { MainLayoutComponent } from './shared/layouts/main-layout-component/main-layout-component';
import { SimpleLayoutComponent } from './shared/layouts/simple-layout-component/simple-layout-component';

export const routes: Routes = [
  {
    path:'',
    component: MainLayoutComponent,
    children : 
    [
      {
        path: '',
        redirectTo: 'parties',
        pathMatch: 'full'
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
    ]
  },
  {
    path:'',
    component: SimpleLayoutComponent,
    children: 
    [
      {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];