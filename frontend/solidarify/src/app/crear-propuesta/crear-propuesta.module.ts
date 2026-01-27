import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearPropuestaPageRoutingModule } from './crear-propuesta-routing.module';

import { CrearPropuestaPage } from './crear-propuesta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearPropuestaPageRoutingModule
  ],
  declarations: [CrearPropuestaPage]
})
export class CrearPropuestaPageModule {}
