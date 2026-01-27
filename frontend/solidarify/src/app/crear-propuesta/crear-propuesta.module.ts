import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';

import { CrearPropuestaPageRoutingModule } from './crear-propuesta-routing.module';
import { CrearPropuestaPage } from './crear-propuesta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    IonicModule,
    CrearPropuestaPageRoutingModule
  ],
  declarations: [CrearPropuestaPage]
})
export class CrearPropuestaPageModule {}
