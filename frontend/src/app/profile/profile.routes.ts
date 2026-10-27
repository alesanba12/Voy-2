import { Routes } from "@angular/router";

export const PROFILE_ROUTES : Routes = [
    {
        path: '',
        loadComponent: () => import('./user-profile/user-profile').then(m => m.UserProfile),
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: '',
    },
]

export default PROFILE_ROUTES;