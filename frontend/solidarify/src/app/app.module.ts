import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { OngDetalleComponent } from './modals/ong-detalle/ong-detalle.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidemenuComponent,
    OngDetalleComponent
  ],
  imports: [
    BrowserModule,
    CommonModule, 
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
