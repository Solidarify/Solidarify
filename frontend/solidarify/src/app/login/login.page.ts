import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  
  private fb = inject(FormBuilder);
  private auth = inject(Auth);   
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]], 
    });
  }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }

  get emailField() { return this.loginForm.get('email'); }
  get passwordField() { return this.loginForm.get('password'); }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    this.auth.login({email, password}).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: async (err) => {
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Fallo de acceso',
          message: 'Email o contraseña incorrectos.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
