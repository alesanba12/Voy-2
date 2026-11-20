import { Routes } from "@angular/router";

export const PROFILE_ROUTES : Routes = [
    {
        path:'',
        redirectTo:'userProfile',
        pathMatch: 'full',
    },
    {
        path: 'userProfile',
        loadComponent: () => import('./user-profile/user-profile').then(m => m.UserProfile),        
    },
     {
        path:'organizerProfile',
        loadComponent:()=>import('./organizer-profile/organizer-profile').then(m =>m.OrganizerProfile)
    },{
        path:'organizerProfile/:externalId',
        loadComponent:()=>import('./organizer-profile/organizer-profile').then(m =>m.OrganizerProfile)
    },
    {
        path: '**',
        redirectTo: '',
    },
   
]

export default PROFILE_ROUTES;