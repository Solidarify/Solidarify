import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Propuesta } from 'src/app/services/propuesta';
import { PropuestaModel } from '../../models/propuesta.model';

@Component({
  selector: 'app-propuesta-detalle',
  templateUrl: './propuesta-detalle.component.html',
  styleUrls: ['./propuesta-detalle.component.scss'],
  standalone: false 
})
export class PropuestaDetalleComponent implements OnInit {
  
  @Input() propuesta!: PropuestaModel; 
  modoEdicion = false;
  propuestaOriginal!: PropuestaModel;
  propuestaEditada!: PropuestaModel;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private propuestaService: Propuesta,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    console.log('Detalle cargado para:', this.propuesta.titulo);

    this.propuestaEditada = new PropuestaModel(this.propuesta);
    this.propuestaOriginal = new PropuestaModel(this.propuesta);
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.propuestaEditada = new PropuestaModel(this.propuestaOriginal);
    this.modoEdicion = false;
  }

  async guardarCambios() {
    const alert = await this.alertCtrl.create({
      header: '¿Guardar cambios?',
      message: 'Los cambios se guardarán permanentemente.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          role: 'confirm',
          handler: async () => {
            
            try {
              const propuestaActualizada = await this.propuestaService
                .update(this.propuestaEditada.idPropuesta!, this.propuestaEditada)
                .toPromise();
              
              this.propuestaOriginal = new PropuestaModel(propuestaActualizada!);
              this.modoEdicion = false;
              
              const toast = await this.toastCtrl.create({
                message: 'Propuesta actualizada correctamente',
                duration: 2000,
                color: 'success'
              });
              
              toast.present();
              this.modalCtrl.dismiss({ propuesta: this.propuestaEditada });

            } catch (error) {
              console.error('Error actualizando:', error);
              const toast = await this.toastCtrl.create({
                message: 'Error al guardar cambios',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  get tipoBienNombre(): string {
    return this.propuestaEditada.tipoBienNombre; 
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  async contactar() {
    const toast = await this.toastCtrl.create({
      message: `Solicitud enviada al organizador #${this.propuesta.idOrganizador}`,
      duration: 2000,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle'
    });
    toast.present();
    }
}
