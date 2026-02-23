import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../services/auth';
import { Propuesta } from '../services/propuesta';
import { UsuarioModel } from '../models/usuario.model';
import { PropuestaModel } from '../models/propuesta.model';

@Component({
  selector: 'app-crear-propuesta',
  templateUrl: './crear-propuesta.page.html',
  styleUrls: ['./crear-propuesta.page.scss'],
  standalone: false
})
export class CrearPropuestaPage implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  
  private auth = inject(Auth);         
  private propuestaService = inject(Propuesta);

  propuestaForm!: FormGroup;
  currentUser: UsuarioModel | null = null;
  fechaMinima: string = new Date().toISOString();

  tiposBienes = [
    { id: 1, nombre: 'Alimentos', descripcion: 'Comida no perecedera y agua' },
    { id: 2, nombre: 'Material Escolar', descripcion: 'Libros, mochilas y papelería' },
    { id: 3, nombre: 'Ropa', descripcion: 'Prendas de vestir para todas las edades' },
    { id: 4, nombre: 'Medicamentos', descripcion: 'Suministros de primeros auxilios y medicinas' },
    { id: 5, nombre: 'Muebles', descripcion: 'Mobiliario para hogares desfavorecidos' },
    { id: 6, nombre: 'Electrodomésticos', descripcion: 'Aparatos de primera necesidad' },
    { id: 7, nombre: 'Juguetes', descripcion: 'Juguetes nuevos o en buen estado para niños' },
    { id: 8, nombre: 'Higiene', descripcion: 'Productos de limpieza personal y para el hogar' },
    { id: 9, nombre: 'Tecnología', descripcion: 'Ordenadores y tablets para brecha digital' },
    { id: 10, nombre: 'Material Deportivo', descripcion: 'Equipamiento para deporte inclusivo' }
  ];


  estadosPropuesta = [
    { value: 'borrador', label: 'Borrador (solo tú lo verás)' },
    { value: 'publicada', label: 'Publicada (visible para todos)' },
    { value: 'en_proceso', label: 'En proceso' }
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    if (!this.auth.isAuthenticated()) {
      this.mostrarToast('Debes iniciar sesión para crear propuestas', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    const user = this.auth.currentUser();
    if (user) {
      this.currentUser = user;
    } else {
      this.router.navigate(['/login']);
    }
  }

  private initForm(): void {
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    this.propuestaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      tipoBien: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      fechaInicio: [hoy.toISOString(), Validators.required],
      fechaFin: [manana.toISOString(), Validators.required],
      estadoPropuesta: ['publicada', Validators.required]
    });
  }

  get f() { return this.propuestaForm.controls; }

  onFechaInicioChange(event: any): void {
    const fechaSeleccionada = event.detail.value;
    if (!fechaSeleccionada) return;

    const finActual = this.propuestaForm.get('fechaFin')?.value;
    if (finActual && new Date(finActual) <= new Date(fechaSeleccionada)) {
      const nuevaFin = new Date(fechaSeleccionada);
      nuevaFin.setDate(nuevaFin.getDate() + 1);
      this.propuestaForm.patchValue({ fechaFin: nuevaFin.toISOString() });
      this.mostrarToast('Fecha fin ajustada automáticamente', 'warning');
    }
  }

  private validarFechas(): boolean {
    const inicio = new Date(this.propuestaForm.value.fechaInicio);
    const fin = new Date(this.propuestaForm.value.fechaFin);

    if (fin <= inicio) {
      this.mostrarToast('La fecha de fin debe ser posterior a la de inicio', 'warning');
      return false;
    }
    
    const unAno = 365 * 24 * 60 * 60 * 1000;
    if (fin.getTime() - inicio.getTime() > unAno) {
      this.mostrarToast('La campaña no puede durar más de 1 año', 'warning');
      return false;
    }
    return true;
  }

  async onSubmit() {
    if (this.propuestaForm.invalid) {
      this.propuestaForm.markAllAsTouched();
      this.mostrarToast('Revisa los campos marcados en rojo', 'warning');
      return;
    }

    if (!this.validarFechas()) return;

    const loading = await this.loadingCtrl.create({
      message: 'Creando propuesta...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const datos = this.prepararDatos();
      
      await firstValueFrom(this.propuestaService.create(datos));

      this.mostrarToast('¡Propuesta creada con éxito!', 'success');
      this.propuestaForm.reset();
      this.router.navigate(['/lista-propuestas']); 

    } catch (error) {
      this.mostrarAlerta('Error', 'No se pudo crear la propuesta. Inténtalo de nuevo.');
    } finally {
      loading.dismiss();
    }
  }

  private prepararDatos(): Partial<PropuestaModel> {
    const val = this.propuestaForm.value;
    return {
      idOrganizador: this.currentUser?.idUsuario,
      idTipoBien: parseInt(val.tipoBien),
      titulo: val.titulo.trim(),
      descripcion: val.descripcion.trim(),
      lugar: val.lugar.trim(),
      fechaInicio: new Date(val.fechaInicio), 
      fechaFin: new Date(val.fechaFin),
      estadoPropuesta: val.estadoPropuesta,
      fechaPublicacion: val.estadoPropuesta === 'publicada' ? new Date() : undefined
    };
  }


  private async mostrarToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    toast.present();
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
