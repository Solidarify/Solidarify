import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Router } from '@angular/router';
import { Usuario } from '../services/usuario';  
import { finalize } from 'rxjs/operators';  

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loginLoading = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: Usuario,     
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ORGANIZADOR', Validators.required]  
    });
  }

  ngOnInit() {}

  get emailField() { return this.loginForm.get('email')!; }
  get passwordField() { return this.loginForm.get('password')!; }
  get roleField() { return this.loginForm.get('role')!; }

 onSubmit() {
  if (this.loginForm.valid) {
    this.loginLoading = true;
    const { email, password } = this.loginForm.value;

    this.usuarioService.login(email, password).subscribe({
      next: (user) => {
        this.loginLoading = false;
        if (user) {
          this.router.navigate(['/home'], { replaceUrl: true });
        } else {
          console.log('Login falló');
        }
      },
      error: (err) => {
        this.loginLoading = false;
        console.error('Error:', err);
      }
    });
  }
}


}
