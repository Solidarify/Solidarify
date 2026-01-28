import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; 
import { ListaPropuestasPageRoutingModule } from './lista-propuestas-routing.module';
import { ListaPropuestasPage } from './lista-propuestas.page';
import { PropuestaDetalleComponent } from '../modals/propuesta-detalle/propuesta-detalle.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule, 
    ListaPropuestasPageRoutingModule
  ],
  declarations: [
    ListaPropuestasPage,
    PropuestaDetalleComponent
  ]
})
export class ListaPropuestasPageModule {}
