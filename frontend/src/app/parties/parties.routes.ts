import { Routes } from "@angular/router";
import { PartyList } from "./party-list/party-list";
import { roleGuard } from "../core/auth/guards/role-guard";
import { authGuard } from "../core/auth/guards/auth-guard";

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
        path: 'mis-eventos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ORGANIZATOR', 'ROLE_ADMIN'] },
        loadComponent: () => import('./my-parties/my-parties').then(m => m.MyParties),
    },
    {
        path: ':id',
        canActivate: [authGuard],
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