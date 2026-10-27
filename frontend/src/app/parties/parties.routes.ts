import { Routes } from "@angular/router";
import { PartyList } from "./party-list/party-list";
import { roleGuard } from "../core/auth/guards/role-guard";

export const PARTIES_ROUTES : Routes = [
    {
        path: '',
        redirectTo: 'catalogo',
        pathMatch: 'full',
    },
    {
        path: 'catalogo',
        loadComponent: () => import('./party-list/party-list').then(m => m.PartyList),
    },
    {
        path: 'new',
        canActivate: [roleGuard],
        data: { roles: [ 'ROLE_ORGANIZATOR', 'ROLE_ADMIN'] },
        loadComponent: () => import('./party-form/party-form').then(m => m.PartyForm),
    },
    {
        path: ':id',
        loadComponent: () => import('./party-detail/party-detail').then(m => m.PartyDetail),
    },
    {
        path: ':id/edit',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ORGANIZATOR','ROLE_ADMIN'] },
        loadComponent: () => import('./party-form/party-form').then(m => m.PartyForm),
    },
    {
        path: '**',
        redirectTo: 'catalogo',
    },
]

export default PARTIES_ROUTES;