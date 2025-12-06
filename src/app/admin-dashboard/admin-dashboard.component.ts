import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isSidebarActive: boolean = false; // Property for sidebar state

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  logout() {
    // Implement your logout logic here
    console.log('Admin user logged out.');
    // Example: redirect to login page
    // this.router.navigate(['/login']); 
  }
}
