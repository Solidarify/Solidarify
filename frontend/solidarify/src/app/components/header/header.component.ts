import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() authMode!: string;
  @Input() isLoggedIn!: boolean;
  @Input() currentUser: any;

  @Output() onLogout = new EventEmitter<void>();

  constructor(private router: Router) {}

  showLogin() { 
    this.router.navigate(['/login']);
  }

  showRegister() { 
    this.router.navigate(['/register']);
  }

  logout() { 
    this.onLogout.emit(); 
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
