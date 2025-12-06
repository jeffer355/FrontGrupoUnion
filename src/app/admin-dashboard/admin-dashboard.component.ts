import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import Router and RouterModule

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule // Add RouterModule here
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isSidebarActive: boolean = false; // Property for sidebar state

  constructor(private router: Router) { } // Inject Router

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  logout() {
    console.log('Admin user logged out.');
    // Clear any authentication tokens or user data from local storage
    localStorage.clear(); // Or specific items like localStorage.removeItem('token');

    // For a more robust solution, an API call to the backend should be made here
    // to invalidate the session/token on the server side.
    // For example: this.authService.logoutBackend().subscribe(() => { ... });

    // Redirect to the login page (assuming '/login' is your login route)
    // replaceUrl: true prevents the user from navigating back to the dashboard using the browser's back button.
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
