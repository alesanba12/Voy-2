import { Routes } from "@angular/router";

export const RECEIPTS_ROUTES : Routes = [
    {
        path: '',
        loadComponent: () => import('./receipt-list/receipt-list').then(m => m.ReceiptList),
        pathMatch: 'full',
    },
    {
        path: ':id',
        loadComponent: () => import('./receipt-detail/receipt-detail').then(m => m.ReceiptDetail),
    },
    {
        path: '**',
        redirectTo: '',
    },
]

export default RECEIPTS_ROUTES;