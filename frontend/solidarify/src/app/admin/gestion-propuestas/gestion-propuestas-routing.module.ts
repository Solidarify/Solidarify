import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionPropuestasPage } from './gestion-propuestas.page';

const routes: Routes = [
  {
    path: '',
    component: GestionPropuestasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionPropuestasPageRoutingModule {}
