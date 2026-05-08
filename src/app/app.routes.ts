import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./pages/catalog/catalog.page').then(m => m.CatalogPage)
      },
      {
        path: 'camera',
        loadComponent: () => import('./pages/camera/camera.page').then(m => m.CameraPage)
      },
      {
        path: 'gallery',
        loadComponent: () => import('./pages/gallery/gallery.page').then(m => m.GalleryPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'book-detail/:id',
        loadComponent: () => import('./pages/book-detail/book-detail.page').then(m => m.BookDetailPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'home',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  }
];
