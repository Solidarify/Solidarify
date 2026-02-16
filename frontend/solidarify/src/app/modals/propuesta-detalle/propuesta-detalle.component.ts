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
  private auth = inject(Auth); 

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

    // Lógica futura: Abrir chat o enviar email
    this.mostrarToast(`Solicitud de contacto enviada al organizador`, 'success');
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

get tipoBienNombre(): string {
  // PropuestaModel ya tiene una lógica para esto
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

 
}
