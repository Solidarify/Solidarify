import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { PerfilOng } from 'src/app/services/perfil-ong';
import { PerfilONGModel } from 'src/app/models/perfil-ong.model';
import { Propuesta } from 'src/app/services/propuesta';
import { Auth } from 'src/app/services/auth';

@Component({
  selector: 'app-ong-detalle',
  templateUrl: './ong-detalle.component.html',
  styleUrls: ['./ong-detalle.component.scss'],
  standalone: false
})
export class OngDetalleComponent implements OnInit {

  @Input() ong!: PerfilONGModel;
  @Input() isAdmin: boolean = false; 

  modoEdicion = false;
  ongOriginal!: PerfilONGModel;
  ongEditada!: PerfilONGModel;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private perfilOngService: PerfilOng,
    private alertCtrl: AlertController,
    private Propuesta: Propuesta,
    public auth: Auth // <-- CAMBIADO DE private A public
  ) {}

  ngOnInit() {
    this.ongEditada = new PerfilONGModel(this.ong);
    this.ongOriginal = new PerfilONGModel(this.ong);
  }

  activarEdicion() {
    if (!this.isAdmin) { return; }   // seguridad en front
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.ongEditada = new PerfilONGModel(this.ongOriginal);
    this.modoEdicion = false;
  }

  async guardarCambios() {
    if (!this.isAdmin) { return; }   // evitar updates si no es ADMIN

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
              const ongActualizada = await this.perfilOngService
                .update(this.ongEditada.idUsuario!, this.ongEditada)
                .toPromise();

              this.ongOriginal = new PerfilONGModel(ongActualizada!);
              this.modoEdicion = false;

              const toast = await this.toastCtrl.create({
                message: 'ONG actualizada correctamente',
                duration: 2000,
                color: 'success'
              });

              await toast.present();
              this.modalCtrl.dismiss({ ong: this.ongEditada });

            } catch (error) {
              console.error('Error actualizando ONG:', error);
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

  cerrar() {
    this.modalCtrl.dismiss();
  }

  async contactar() {
    // Todos los usuarios pueden usar "contactar" (ver teléfono / web)
    const toast = await this.toastCtrl.create({
      message: `Contacto: ${this.ong.telefonoContacto || 'Sin teléfono'}${this.ong.web ? ' · ' + this.ong.web : ''}`,
      duration: 2500,
      color: 'primary',
      position: 'bottom',
      icon: 'call-outline'
    });
    await toast.present();
  }

  async solicitarApoyo() {
    const organizadorId = this.auth.currentUser()?.idUsuario;
    
    // IMPORTANTE: Asegúrate de que el método "getFiltradas" funciona correctamente y 
    // devuelve las propuestas de este organizador que no tienen ONG asignada aún.
    this.Propuesta.getFiltradas({ organizador: organizadorId, estado: 'publicada' }).subscribe(async (misPropuestasBuscandoOng) => {
       
       if (misPropuestasBuscandoOng.length === 0) {
         const alert = await this.alertCtrl.create({
           header: 'Sin campañas disponibles',
           message: 'No tienes campañas activas buscando ONG. Crea una propuesta primero.',
           buttons: ['OK']
         });
         await alert.present();
         return;
       }

       const inputs = misPropuestasBuscandoOng.map((p: any) => ({
         type: 'radio',
         label: p.titulo,
         value: p.idPropuesta
       }));

       const alert = await this.alertCtrl.create({
         header: `Solicitar apoyo a ${this.ong.displayName}`,
         message: 'Selecciona qué campaña quieres que respalde esta ONG:',
         inputs: inputs as any,
         buttons: [
           { text: 'Cancelar', role: 'cancel' },
           {
             text: 'Enviar Solicitud',
             handler: (idPropuestaSeleccionada) => {
               if(idPropuestaSeleccionada) {
                 this.enviarPeticionAlBackend(idPropuestaSeleccionada);
               }
             }
           }
         ]
       });
       await alert.present();
    });
  }

  private enviarPeticionAlBackend(idPropuesta: number) {
     this.Propuesta.solicitarVinculacionOng(idPropuesta, this.ong.idUsuario!).subscribe({
        next: async () => {
           console.log("Solicitud enviada");
           const toast = await this.toastCtrl.create({
             message: 'Solicitud enviada a la ONG correctamente',
             duration: 2500,
             color: 'success'
           });
           await toast.present();
           this.modalCtrl.dismiss({ refresh: true }); 
        },
        error: async (err) => {
           console.error("Error", err);
           const toast = await this.toastCtrl.create({
             message: 'Error al enviar la solicitud',
             duration: 2000,
             color: 'danger'
           });
           await toast.present();
        }
     });
  }

}
