import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaOngsPageRoutingModule } from './lista-ongs-routing.module';

import { ListaOngsPage } from './lista-ongs.page'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ListaOngsPageRoutingModule  
  ],
  declarations: [
    ListaOngsPage,
  ]
})
export class ListaOngsPageModule {}
