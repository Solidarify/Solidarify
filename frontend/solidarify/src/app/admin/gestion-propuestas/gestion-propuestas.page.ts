import { Component, OnInit, inject } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs'; 
import { Propuesta } from '../../services/propuesta';
import { PropuestaModel } from '../../models/propuesta.model';
import { PropuestaDetalleComponent } from '../../modals/propuesta-detalle/propuesta-detalle.component';

@Component({
  selector: 'app-gestion-propuestas',
  templateUrl: './gestion-propuestas.page.html',
  styleUrls: ['./gestion-propuestas.page.scss'],
  standalone: false
})
export class GestionPropuestasPage implements OnInit {

  private propuestasService = inject(Propuesta);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController); 
  private router = inject(Router);

  // ESTADO
  propuestas: PropuestaModel[] = [];
  filtroEstado: string = 'todos'; 
  loading = true;

  constructor() {}

  ngOnInit() {
    this.cargarPropuestas();
  }

  async cargarPropuestas() {
    this.loading = true;
    try {
      this.propuestas = await firstValueFrom(this.propuestasService.getAllAdmin());
    } catch (error) {
      this.mostrarToast('Error al cargar datos', 'danger');
    } finally {
      this.loading = false;
    }
  }

  get propuestasFiltradas() {
    if (this.filtroEstado === 'todos') return this.propuestas;
    return this.propuestas.filter(p => p.estadoPropuesta === this.filtroEstado);
  }

  async gestionar(propuesta: PropuestaModel) {
    const esBorrador = propuesta.estadoPropuesta === 'borrador';

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Administrar: ${propuesta.titulo}`,
      buttons: [
        {
          text: '✏️ Editar Propuesta',
          icon: 'create',
          handler: () => {
            this.abrirModalEdicion(propuesta);
          }
        },
        {
          text: '🏢 Asignar ONG Manualmente',
          icon: 'business',
          handler: () => this.abrirAsignacionManual(propuesta)
        },
        {
          text: esBorrador ? '✅ Publicar (Activar)' : '📂 Mover a Borrador',
          icon: esBorrador ? 'checkmark-circle' : 'archive',
          handler: () => {
            const nuevoEstado = esBorrador ? 'publicada' : 'borrador';
            this.cambiarEstado(propuesta, nuevoEstado);
          }
        },
        {
          text: '🗑️ Eliminar Definitivamente',
          role: 'destructive',
          icon: 'trash',
          handler: () => this.confirmarBorrado(propuesta)
        },
        { text: 'Cancelar', role: 'cancel', icon: 'close' }
      ]
    });
    await actionSheet.present();
  }

  async abrirModalEdicion(propuesta: PropuestaModel) {
    const modal = await this.modalCtrl.create({
      component: PropuestaDetalleComponent,
      componentProps: {
        propuesta: propuesta,
        startInEditMode: true
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'propuesta-modal-sheet'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    
    if (data && data.refresh) {
      this.cargarPropuestas();
    }
  }

  async cambiarEstado(propuesta: PropuestaModel, nuevoEstado: string) {
    try {
      await firstValueFrom(this.propuestasService.cambiarEstadoAdmin(propuesta.idPropuesta || 0, nuevoEstado));
      
      this.mostrarToast(`Estado cambiado a: ${nuevoEstado.toUpperCase()}`, 'success');
      this.cargarPropuestas();
    } catch (error) {
      this.mostrarToast('Error al cambiar estado', 'danger');
    }
  }

  async abrirAsignacionManual(propuesta: PropuestaModel) {
    const alert = await this.alertCtrl.create({
      header: 'Asignación Forzada',
      message: 'Introduce el ID numérico de la ONG.',
      inputs: [
        {
          name: 'ongId',
          type: 'number',
          placeholder: 'Ej: 5'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Asignar',
          handler: async (data) => {
            if (!data.ongId) {
              this.mostrarToast('Debes escribir un ID válido', 'warning');
              return false; 
            }
            return this.ejecutarAsignacion(propuesta, Number(data.ongId));
          }
        }
      ]
    });
    await alert.present();
  }

  async ejecutarAsignacion(propuesta: PropuestaModel, idOng: number) {
    try {
      await firstValueFrom(this.propuestasService.asignarOngManual(propuesta.idPropuesta || 0, idOng));
      this.mostrarToast('Propuesta asignada correctamente', 'success');
      this.cargarPropuestas();
    } catch (error) {
      this.mostrarToast('Error asignando ONG (¿ID existe?)', 'danger');
    }
  }

  async confirmarBorrado(propuesta: PropuestaModel) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar propuesta?',
      message: `Vas a borrar "<strong>${propuesta.titulo}</strong>". Esta acción es irreversible.`,
      cssClass: 'custom-alert-danger',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await firstValueFrom(this.propuestasService.delete(propuesta.idPropuesta || 0));
              this.mostrarToast('Propuesta eliminada', 'success');
              
              this.propuestas = this.propuestas.filter(p => p.idPropuesta !== propuesta.idPropuesta);
              
            } catch (error) {
              this.mostrarToast('Error al eliminar', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom',
      icon: color === 'danger' ? 'alert-circle' : 'checkmark-circle'
    });
    toast.present();
  }
}
