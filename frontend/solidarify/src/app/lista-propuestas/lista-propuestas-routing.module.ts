import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaPropuestasPage } from './lista-propuestas.page';

const routes: Routes = [
  {
    path: '',
    component: ListaPropuestasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaPropuestasPageRoutingModule {}
