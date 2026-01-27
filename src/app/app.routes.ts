import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';


export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home').then(m => m.Home)
    },
    {
        path: 'products',
        loadComponent: () => import('./components/products/products').then(m => m.Products)
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./components/product-detail/product-detail').then(m => m.ProductDetail)
    },
    {
        path: 'cart',
        loadComponent: () => import('./components/user/cart/cart').then(m => m.Cart)
    },

    {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login').then(m => m.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/auth/register/register').then(m => m.Register)
    },

    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: 'orders',
                loadComponent: () => import('./components/user/orders/orders').then(m => m.Orders)
            },
            {
                path: 'profile',
                loadComponent: () => import('./components/user/user').then(m => m.User)
            },
            {
                path: 'password',
                loadComponent: () => import('./components/change-password/change-password').then(m => m.ChangePassword)
            }
        ]
    },

    {
        path: '',
        canActivate: [adminGuard],
        children: [
            {
                path: 'admin/new-product',
                loadComponent: () => import('./components/admin/add-product/add-product').then(m => m.AddProduct)
            },
            {
                path: 'admin/edit-product/:id',
                loadComponent: () => import('./components/admin/edit-product/edit-product').then(m => m.EditProduct)
            },
            {
                path: 'admin/products',
                loadComponent: () => import('./components/admin/products-list/products-list').then(m => m.ProductsList)
            },
            {
                path: 'admin/new-size',
                loadComponent: () => import('./components/admin/add-size/add-size').then(m => m.AddSize)
            },
            {
                path: 'admin/sizes',
                loadComponent: () => import('./components/admin/sizes-list/sizes-list').then(m => m.SizesList)
            },
            {
                path: 'admin/new-color',
                loadComponent: () => import('./components/admin/add-color/add-color').then(m => m.AddColor)
            },
            {
                path: 'admin/colors',
                loadComponent: () => import('./components/admin/colors-list/colors-list').then(m => m.ColorsList)
            },
            {
                path: 'admin/new-brand',
                loadComponent: () => import('./components/admin/add-brand/add-brand').then(m => m.AddBrand)
            },
            {
                path: 'admin/brands',
                loadComponent: () => import('./components/admin/brands-list/brands-list').then(m => m.BrandsList)
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./components/admin/users-list/users-list').then(m => m.UsersList)
            }
        ]
    },

    {
        path: 'success',
        loadComponent: () => import('./components/payment/order-confirmation/order-confirmation').then(m => m.OrderConfirmation)
    },
    {
        path: 'cancel',
        loadComponent: () => import('./components/payment/payment-cancel/payment-cancel').then(m => m.PaymentCancel)
    },

    {
        path: '**',
        loadComponent: () => import('./components/page-not-found/page-not-found').then(m => m.PageNotFound)
    }
];
