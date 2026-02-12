import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaOngsPage } from './lista-ongs.page';

const routes: Routes = [
  {
    path: '',
    component: ListaOngsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaOngsPageRoutingModule {}
