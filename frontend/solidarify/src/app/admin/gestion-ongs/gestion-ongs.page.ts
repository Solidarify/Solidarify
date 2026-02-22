import { Component, OnInit, inject } from '@angular/core';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { PerfilOng } from '../../services/perfil-ong'; 
import { PerfilONGModel } from '../../models/perfil-ong.model';

@Component({
  selector: 'app-gestion-ongs',
  templateUrl: './gestion-ongs.page.html',
  styleUrls: ['./gestion-ongs.page.scss'],
  standalone: false
})
export class GestionOngsPage implements OnInit {
  
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private actionSheetCtrl = inject(ActionSheetController);
  private ongService = inject(PerfilOng); 

  ongs: PerfilONGModel[] = []; 
  filtroEstado: string = 'todos';
  cargando = true;

  constructor() { }

  ngOnInit() {
    this.cargarOngs();
  }

  async cargarOngs() {
    this.cargando = true;
    try {
      this.ongs = await firstValueFrom(this.ongService.getAll());
    } catch (error) {
      this.mostrarToast('Error al cargar datos', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  get ongsFiltradas() {
    if (this.filtroEstado === 'todos') return this.ongs;
    return this.ongs.filter(o => o.estadoVerificacion === this.filtroEstado);
  }

  async gestionarOng(ong: PerfilONGModel) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Acciones para ${ong.nombreLegal}`,
      buttons: [
        {
          text: '✅ Verificar ONG',
          icon: 'checkmark-circle',
          handler: () => this.ejecutarCambioEstado(ong, true) 
        },
        {
          text: '❌ Rechazar Solicitud',
          icon: 'close-circle',
          role: 'destructive',
          handler: () => this.ejecutarCambioEstado(ong, false) 
        },
        {
          text: '🗑️ Eliminar Registro',
          icon: 'trash',
          role: 'destructive',
          handler: () => this.confirmarBorrado(ong)
        },
        { text: 'Cancelar', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async ejecutarCambioEstado(ong: PerfilONGModel, aprobado: boolean) {
    try {
      await firstValueFrom(this.ongService.verificar(ong.idUsuario ?? 0, aprobado));
      
      this.mostrarToast(
        `ONG ${aprobado ? 'Verificada' : 'Rechazada'} correctamente`, 
        aprobado ? 'success' : 'warning'
      );
      
      this.cargarOngs();

    } catch (error) {
      this.mostrarToast('Error actualizando estado', 'danger');
    }
  }

  async confirmarBorrado(ong: PerfilONGModel) {
  const alert = await this.alertCtrl.create({
    header: '¿Eliminar ONG?',
    message: `Estás a punto de borrar a ${ong.nombreLegal}. Esta acción no se puede deshacer.`,
    cssClass: 'custom-alert-danger',
    buttons: [
      { 
        text: 'Cancelar', 
        role: 'cancel',
        cssClass: 'alert-button-cancel'
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        cssClass: 'alert-button-confirm',
        handler: async () => {
            try {
              await firstValueFrom(this.ongService.delete(ong.idUsuario ?? 0));
              this.mostrarToast('ONG eliminada', 'success');
              this.cargarOngs();
            } catch (e) {
              this.mostrarToast('Error al eliminar', 'danger');
            }
          }
      }
    ]
  });
  await alert.present();
}


  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
