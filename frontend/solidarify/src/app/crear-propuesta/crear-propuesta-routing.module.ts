import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearPropuestaPage } from './crear-propuesta.page';

const routes: Routes = [
  {
    path: '',
    component: CrearPropuestaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearPropuestaPageRoutingModule {}
