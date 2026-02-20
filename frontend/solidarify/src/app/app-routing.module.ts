import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; 
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule) },
  
  { 
    path: 'account', 
    loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule),
    canActivate: [AuthGuard] 
  },
  { 
    path: 'lista-propuestas', 
    loadChildren: () => import('./lista-propuestas/lista-propuestas.module').then(m => m.ListaPropuestasPageModule),
  },
 { 
    path: 'lista-ongs', 
    loadChildren: () => import('./lista-ongs/lista-ongs.module').then(m => m.ListaOngsPageModule),
  },

  { 
    path: 'crear-propuesta', 
    loadChildren: () => import('./crear-propuesta/crear-propuesta.module').then(m => m.CrearPropuestaPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ORGANIZADOR' }
  },
  
  { 
    path: 'gestion-ongs', 
    loadChildren: () => import('./admin/gestion-ongs/gestion-ongs.module').then( m => m.GestionOngsPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  { 
    path: 'gestion-propuestas', 
    loadChildren: () => import('./admin/gestion-propuestas/gestion-propuestas.module').then( m => m.GestionPropuestasPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  { 
    path: 'statistic', 
    loadChildren: () => import('./statistic/statistic.module').then(m => m.StatisticPageModule),
  },

  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
