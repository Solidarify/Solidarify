import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaPropuestasPageRoutingModule } from './lista-propuestas-routing.module';

import { ListaPropuestasPage } from './lista-propuestas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaPropuestasPageRoutingModule
  ],
  declarations: [ListaPropuestasPage]
})
export class ListaPropuestasPageModule {}
