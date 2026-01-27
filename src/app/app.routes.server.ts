import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'success',
    renderMode: RenderMode.Server
  },
  {
    path: 'cancel',
    renderMode: RenderMode.Server
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/edit-product/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
