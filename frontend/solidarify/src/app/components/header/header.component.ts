import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  @Input() isLoggedIn = false;
  @Input() currentUser: any = null;

  @Output() onLogout = new EventEmitter<void>();

  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/home']);
  }
}
