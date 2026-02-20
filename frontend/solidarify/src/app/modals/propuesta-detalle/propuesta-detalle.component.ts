import { Component, OnInit, Input, inject } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Propuesta } from '../../services/propuesta';
import { Auth } from '../../services/auth';
import { PropuestaModel } from '../../models/propuesta.model';

@Component({
  selector: 'app-propuesta-detalle',
  templateUrl: './propuesta-detalle.component.html',
  styleUrls: ['./propuesta-detalle.component.scss'],
  standalone: false 
})
export class PropuestaDetalleComponent implements OnInit {
  
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private propuestaService = inject(Propuesta);
  public auth = inject(Auth); 

  @Input() propuesta!: PropuestaModel; 

  modoEdicion = false;
  propuestaEditada!: PropuestaModel; 

  constructor() { }

  ngOnInit() {
    this.propuestaEditada = new PropuestaModel(this.propuesta);
  }

  get puedeEditar(): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;

    return this.auth.hasRole('ADMIN') || user.idUsuario === this.propuesta.idOrganizador;
  }

  get esMiPropuesta(): boolean {
    const user = this.auth.currentUser();
    return user?.idUsuario === this.propuesta.idOrganizador;
  }

  // --- NUEVOS GETTERS PARA LA LÓGICA DE ONG ---
  get esLaOngSolicitada(): boolean {
    const userId = this.auth.currentUser()?.idUsuario;
    return this.auth.hasRole('ONG') && this.propuesta.idOngAsignada === userId;
  }

  get esSolicitudPendiente(): boolean {
    return this.propuesta.estadoPropuesta === 'pendiente_ong';
  }
  // ---------------------------------------------

  get tipoBienNombre(): string {
    const map: {[key: number]: string} = {
      1: 'Alimentos',
      2: 'Ropa',
      3: 'Juguetes',
      4: 'Material Escolar',
      5: 'Higiene',
      10: 'Otros'
    };
    return map[this.propuestaEditada.idTipoBien] || 'Varios';
  }

  activarEdicion() {
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.propuestaEditada = new PropuestaModel(this.propuesta);
    this.modoEdicion = false;
  }

  async guardarCambios() {
    const alert = await this.alertCtrl.create({
      header: '¿Guardar cambios?',
      message: 'La información se actualizará públicamente.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: () => this.ejecutarGuardado()
        }
      ]
    });
    await alert.present();
  }

  private async ejecutarGuardado() {
    try {
      const actualizada = await firstValueFrom(
        this.propuestaService.update(this.propuestaEditada.idPropuesta!, this.propuestaEditada)
      );
      
      this.mostrarToast('Propuesta actualizada correctamente', 'success');
      
      this.modalCtrl.dismiss({ 
        propuesta: actualizada,
        refresh: true 
      });

    } catch (error) {
      console.error('Error actualizando:', error);
      this.mostrarToast('Error al guardar cambios', 'danger');
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  async contactar() {
    if (!this.auth.isAuthenticated()) {
      this.mostrarToast('Debes iniciar sesión para contactar', 'warning');
      return;
    }

    if (this.esMiPropuesta) {
      this.mostrarToast('¡Es tu propia propuesta!', 'medium');
      return;
    }

    this.mostrarToast(`Solicitud de contacto enviada al organizador`, 'success');
  }

  async responderSolicitud(acepta: boolean) {
    const headerText = acepta ? 'Aceptar Campaña' : 'Rechazar Solicitud';
    const messageText = acepta 
      ? '¿Estás seguro de que tu ONG respaldará esta campaña de recogida?' 
      : 'Esta propuesta volverá a quedar sin ONG asignada.';

    const alert = await this.alertCtrl.create({
      header: headerText,
      message: messageText,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: acepta ? 'Sí, Aceptar' : 'Sí, Rechazar',
          role: 'confirm',
          handler: () => {
            this.propuestaService.responderSolicitudOng(this.propuesta.idPropuesta!, acepta).subscribe({
              next: () => {
                this.mostrarToast(acepta ? '¡Campaña vinculada con tu ONG!' : 'Solicitud rechazada.', 'success');
                this.modalCtrl.dismiss({ refresh: true });
              },
              error: (err) => {
                console.error("Error respondiendo", err);
                this.mostrarToast('Ocurrió un error al procesar tu respuesta.', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async mostrarToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    await toast.present();
  }
}
