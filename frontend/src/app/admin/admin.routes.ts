import { Routes } from "@angular/router";
import { roleGuard } from "../core/auth/guards/role-guard";
import { AdminLayout } from "./admin-layout/admin-layout";

export const ADMIN_ROUTES : Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: '',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        component:AdminLayout,
        children:[
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
            },
            {
                path: 'solicitudes',
                loadComponent: () => import('./organizer-requests-table/organizer-requests-table').then(m=>m.OrganizerRequestsTable),
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./users-table/users-table').then(m=>m.UsersTable),
            },
            {
                path: 'eventos',
                loadComponent: () => import('./parties-table/parties-table').then(m=>m.PartiesTable),
            },
            {
                path: 'tickets',
                loadComponent: () => import('./tickets-table/tickets-table').then(m=>m.TicketsTable),
            },
        ]
    },
    {
        path: '**',
        redirectTo : 'dashboard',
    },
]

export default ADMIN_ROUTES;