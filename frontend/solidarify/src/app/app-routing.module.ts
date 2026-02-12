import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule) },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule) },
  
  // ✅ RUTAS PROPUESTAS CORRECTAS
  { path: 'lista-propuestas/:mode', loadChildren: () => import('./lista-propuestas/lista-propuestas.module').then(m => m.ListaPropuestasPageModule) },
  { path: 'explorar', redirectTo: 'lista-propuestas/explore', pathMatch: 'full' },  // Alias
  { path: 'crear-propuesta', loadChildren: () => import('./crear-propuesta/crear-propuesta.module').then(m => m.CrearPropuestaPageModule) },  {
    path: 'lista-ongs',
    loadChildren: () => import('./lista-ongs/lista-ongs.module').then( m => m.ListaOngsPageModule)
  }

];

/*
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule) },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule) },
  { path: 'crear-propuesta', loadChildren: () => import('./crear-propuesta/crear-propuesta.module').then(m => m.CrearPropuestaPageModule) },
  { path: 'lista-propuestas', loadChildren: () => import('./lista-propuestas/lista-propuestas.module').then(m => m.ListaPropuestasPageModule), data: { mode: 'mine' } },
  { path: 'explorar', loadChildren: () => import('./lista-propuestas/lista-propuestas.module').then(m => m.ListaPropuestasPageModule), data: { mode: 'explore' }},
];
*/



@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
