import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-propuesta-detalle',
  templateUrl: './propuesta-detalle.component.html',
  styleUrls: ['./propuesta-detalle.component.scss'],
  standalone: false 
})
export class PropuestaDetalleComponent implements OnInit {
  
  @Input() propuesta: any; 

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    console.log('Detalle cargado para:', this.propuesta.Titulo);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  async contactar() {
    const toast = await this.toastCtrl.create({
      message: `Solicitud enviada al organizador #${this.propuesta.IdOrganizador}`,
      duration: 2000,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle'
    });
    toast.present();
    }
}
