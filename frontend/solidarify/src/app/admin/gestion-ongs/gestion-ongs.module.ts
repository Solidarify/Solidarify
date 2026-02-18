import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionOngsPageRoutingModule } from './gestion-ongs-routing.module';

import { GestionOngsPage } from './gestion-ongs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionOngsPageRoutingModule
  ],
  declarations: [GestionOngsPage]
})
export class GestionOngsPageModule {}
