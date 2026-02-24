import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionOngsPage } from './gestion-ongs.page';

const routes: Routes = [
  {
    path: '',
    component: GestionOngsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionOngsPageRoutingModule {}
