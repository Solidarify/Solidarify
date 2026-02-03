import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Usuario } from '../services/usuario';
import { UsuarioModel } from '../models/usuario.model';

@Component({
  selector: 'app-crear-propuesta',
  templateUrl: './crear-propuesta.page.html',
  styleUrls: ['./crear-propuesta.page.scss'],
  standalone: false
})
export class CrearPropuestaPage implements OnInit {

  propuestaForm!: FormGroup;
  loading = false;
  fechaMinima: string;
  
  currentUser: UsuarioModel | null = null; 

  tiposBienes = [
    { id: 1, nombre: 'Alimentos no perecederos' },
    { id: 2, nombre: 'Ropa y calzado' },
    { id: 3, nombre: 'Juguetes' },
    { id: 4, nombre: 'Material escolar' },
    { id: 5, nombre: 'Productos de higiene' },
    { id: 6, nombre: 'Medicamentos' },
    { id: 7, nombre: 'Muebles' },
    { id: 8, nombre: 'Libros' },
    { id: 9, nombre: 'Electrodomésticos' },
    { id: 10, nombre: 'Otros' }
  ];

  estadosPropuesta = [
    { value: 'borrador', label: 'Borrador (solo tú lo verás)' },
    { value: 'publicada', label: 'Publicada (visible para todos)' },
    { value: 'en_proceso', label: 'En proceso' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private usuarioService: Usuario
  ) {
    this.fechaMinima = new Date().toISOString();
  }

  ngOnInit() {
    this.usuarioService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (!this.currentUser) {
        const saved = localStorage.getItem('currentUser');
        if (!saved) {
          console.error('Usuario no logeado. Redirigiendo...');
          this.router.navigate(['/login']);
        } else {
          this.currentUser = JSON.parse(saved);
        }
      }
    });

    this.initForm();
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

  get tituloField(): AbstractControl | null { 
    return this.propuestaForm.get('titulo'); 
  }

  get descripcionField(): AbstractControl | null { 
    return this.propuestaForm.get('descripcion'); 
  }

  get tipoBienField(): AbstractControl | null { 
    return this.propuestaForm.get('tipoBien'); 
  }

  get lugarField(): AbstractControl | null { 
    return this.propuestaForm.get('lugar'); 
  }

  onFechaInicioChange(event: any): void {
    const fechaSeleccionada = event.detail.value;
    
    if (!fechaSeleccionada) return;

    this.propuestaForm.patchValue({ fechaInicio: fechaSeleccionada });
    this.propuestaForm.get('fechaInicio')?.markAsTouched();
    
    const fechaFinActual = this.propuestaForm.get('fechaFin')?.value;
    
    if (fechaFinActual && new Date(fechaFinActual) <= new Date(fechaSeleccionada)) {
      const nuevaFechaFin = new Date(fechaSeleccionada);
      nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1); 
      this.propuestaForm.patchValue({ fechaFin: nuevaFechaFin.toISOString() });
      
      this.mostrarToast('La fecha de fin se ajustó automáticamente', 'warning');
    }
  }

  onFechaFinChange(event: any): void {
    const fechaSeleccionada = event.detail.value;
    
    if (!fechaSeleccionada) return;

    this.propuestaForm.patchValue({ fechaFin: fechaSeleccionada });
    this.propuestaForm.get('fechaFin')?.markAsTouched();
  }

  private validarFechas(): boolean {
    const fechaInicio = this.propuestaForm.get('fechaInicio')?.value;
    const fechaFin = this.propuestaForm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin) {
      this.mostrarToast('Debes seleccionar ambas fechas', 'warning');
      return false;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      this.mostrarToast('La fecha de fin debe ser posterior a la fecha de inicio', 'warning');
      return false;
    }

    const unAnoEnMs = 365 * 24 * 60 * 60 * 1000;
    if (fin.getTime() - inicio.getTime() > unAnoEnMs) {
      this.mostrarToast('La campaña no puede durar más de 1 año', 'warning');
      return false;
    }

    return true;
  }

  async onSubmit(): Promise<void> {
    this.propuestaForm.markAllAsTouched();

    if (this.propuestaForm.invalid) {
      console.log('Formulario inválido. Errores:');
      Object.keys(this.propuestaForm.controls).forEach(key => {
        const controlErrors = this.propuestaForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`- ${key}:`, controlErrors);
        }
      });
      
      await this.mostrarToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    if (!this.validarFechas()) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creando propuesta...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const formData = this.prepareFormData();
      console.log('📤 Datos a enviar:', formData);

      // await this.propuestaService.create(formData).toPromise();
      
      // Simulación por ahora
      await new Promise(resolve => setTimeout(resolve, 1500));

      await loading.dismiss();
      
      await this.mostrarToast('¡Propuesta creada exitosamente!', 'success');
      
      this.propuestaForm.reset({
        estadoPropuesta: 'publicada',
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(Date.now() + 86400000).toISOString() // +1 día
      });
      
      this.router.navigate(['/lista-propuestas']);

    } catch (error) {
      await loading.dismiss();
      console.error('❌ Error al crear propuesta:', error);
      await this.showAlert('Error', 'Ocurrió un error al guardar la propuesta. Inténtalo de nuevo.');
    }
  }

  private prepareFormData(): any {
    const formValues = this.propuestaForm.value;
    
    return {
      idOrganizador: this.currentUser?.idUsuario || 0,
      idTipoBien: parseInt(formValues.tipoBien),
      titulo: formValues.titulo.trim(),
      descripcion: formValues.descripcion.trim(),
      lugar: formValues.lugar.trim(),
      fechaInicio: formValues.fechaInicio,
      fechaFin: formValues.fechaFin,
      estadoPropuesta: formValues.estadoPropuesta,
      fechaCreacion: new Date().toISOString()
    };
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  private async mostrarToast(message: string, color: 'success' | 'warning' | 'danger' = 'warning'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle-outline'
    });
    toast.present();
  }
}
